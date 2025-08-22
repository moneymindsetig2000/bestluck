


declare global {
  interface Window {
    puter: any;
  }
}

// ensureToken.ts - small helper to guarantee SDK token available
export async function ensurePuterToken() {
  if (!window.puter || !window.puter.auth) {
    throw new Error('Puter auth missing');
  }
  try {
    // Some SDKs refresh/attach token when authToken() is invoked
    if (typeof window.puter.auth.authToken === 'function') {
      const t = await window.puter.auth.authToken();
      // For debugging, you can log first 20 chars (redact in production)
      console.debug('ensurePuterToken() token present?', !!t, 'token preview:', t?.slice?.(0,20));
      return t;
    }
  } catch (e) {
    console.warn('ensurePuterToken: authToken() threw', e);
    // fallthrough to return undefined -> caller can handle
  }
  return undefined;
}

export const safePuterFs = {
  async mkdir(path: string, opts = { createMissingParents: true }) {
    await ensurePuterToken();
    try {
      return await window.puter.fs.mkdir(path, opts);
    } catch (err: any) {
      // Ignore "already exists" error, which is not a failure for mkdir.
      if (err?.code === 'subject_already_exists' || err?.code === 'subject_exists') {
        return;
      }

      // If it's a transient auth error (401 or 403), refresh token and retry once.
      if (err?.status === 401 || err?.status === 403 || err?.code === 'unauthorized') {
        console.warn(`mkdir received auth error (${err.status || err.code}), retrying...`);
        await ensurePuterToken();
        try {
            // After retrying, we also need to check for "already exists" in case of a race condition.
            return await window.puter.fs.mkdir(path, opts);
        } catch (retryErr: any) {
            if (retryErr?.code === 'subject_already_exists' || retryErr?.code === 'subject_exists') {
                return;
            }
            // If the retry fails for a different reason, throw that error.
            throw retryErr;
        }
      }
      
      // For any other initial error, throw it.
      throw err;
    }
  },

  async readdir(path: string) {
    await ensurePuterToken();
    try {
      return await window.puter.fs.readdir(path);
    } catch (err: any) {
      // if folder doesn't exist -> create & return empty list
      if (err?.code === 'subject_does_not_exist') {
        await this.mkdir(path, { createMissingParents: true });
        return [];
      }
      // on 401/403, try refresh token + retry once
      if (err?.status === 401 || err?.status === 403 || err?.code === 'unauthorized') {
        console.warn(`readdir received auth error (${err.status || err.code}), retrying...`);
        await ensurePuterToken();
        return await window.puter.fs.readdir(path);
      }
      throw err;
    }
  },

  async read(path: string) {
    await ensurePuterToken();
    try {
      return await window.puter.fs.read(path);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        console.warn(`read received auth error (${err.status}), retrying...`);
        await ensurePuterToken();
        return await window.puter.fs.read(path);
      }
      throw err;
    }
  },

  async write(path: string, data: string, opts = { createMissingParents: true }) {
    await ensurePuterToken();
    try {
      return await window.puter.fs.write(path, data, opts);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        console.warn(`write received auth error (${err.status}), retrying...`);
        await ensurePuterToken();
        return await window.puter.fs.write(path, data, opts);
      }
      throw err;
    }
  },

  async delete(path: string) {
    await ensurePuterToken();
    try {
      return await window.puter.fs.delete(path);
    } catch (err: any) {
      // if it's a transient auth error (401 or 403), refresh token and retry once.
      if (err?.status === 401 || err?.status === 403 || err?.code === 'unauthorized') {
        console.warn(`delete received auth error (${err.status || err.code}), retrying...`);
        await ensurePuterToken();
        return await window.puter.fs.delete(path);
      }
      // If the file doesn't exist, we can consider the deletion successful for our purpose.
      if (err?.code === 'subject_does_not_exist') {
        console.warn(`Attempted to delete a non-existent file: ${path}. Ignoring.`);
        return;
      }
      // For any other initial error, throw it.
      throw err;
    }
  },
};

export const getChatsDirForUser = (user: { uid?: string; uuid?: string; sub?: string } | null) => {
  if (!user) return '/tmp/ai-fiesta-clone/chats'; // fallback when user absent
  const uid = user.uuid || user.uid || user.sub;
  if (!uid) {
    console.error("Could not determine user ID for filesystem path.");
    // Fallback to a temporary, non-persistent path
    return `/tmp/ai-fiesta-clone/chats_${Date.now()}`;
  }
  // For an authenticated user, return a relative path.
  // The Puter SDK will automatically scope this to the current user's private storage for this app.
  // This resolves the "403 Forbidden" error caused by trying to access an absolute path like '/users/...'.
  return 'chats';
};