
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
    try {
      await ensurePuterToken();
      return await window.puter.fs.mkdir(path, opts);
    } catch (err: any) {
      // ignore "already exists" style errors
      if (err?.code === 'subject_already_exists' || err?.code === 'subject_exists') return;
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
      // on 401, try refresh token + retry once
      if (err?.status === 401 || err?.code === 'unauthorized') {
        try {
          await ensurePuterToken();
          return await window.puter.fs.readdir(path);
        } catch(e) {
          // fallthrough
        }
      }
      throw err;
    }
  },

  async read(path: string) {
    await ensurePuterToken();
    try {
      return await window.puter.fs.read(path);
    } catch (err: any) {
      if (err?.status === 401) {
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
      if (err?.status === 401) {
        await ensurePuterToken();
        return await window.puter.fs.write(path, data, opts);
      }
      throw err;
    }
  }
};

export const getChatsDirForUser = (user: { uid?: string; uuid?: string; sub?: string } | null) => {
  if (!user) return '/tmp/ai-fiesta-clone/chats'; // fallback when user absent
  const uid = user.uuid || user.uid || user.sub;
  return `/users/${uid}/ai-fiesta-clone/chats`;
};
