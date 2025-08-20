
import React from 'react';
import FadeInSection from './FadeInSection';

const logos = [
  'OpenAI', 'Google', 'Anthropic', 'Meta', 'Mistral', 'Microsoft'
];

const TrustedBy: React.FC = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        <FadeInSection>
          <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Powering results from the world's most innovative AI companies
          </h2>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {logos.map((logo) => (
              <div key={logo} className="text-gray-400 text-2xl font-medium grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                {logo}
              </div>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
};

export default TrustedBy;
