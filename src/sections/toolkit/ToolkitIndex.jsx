import { Link } from 'react-router-dom';
import { Wrench, ArrowRight, Network, GitMerge, AlertTriangle, Briefcase } from 'lucide-react';
import { SECTIONS } from '../../utils/constants';

export default function ToolkitIndex() {
  const toolkitSection = SECTIONS.find((s) => s.id === 'toolkit');
  
  // Custom icons and descriptions for each topic
  const topicDetails = {
    'flowchart': {
      icon: Network,
      description: 'A step-by-step methodology for tackling wireless engineering problems.'
    },
    'decision-tree': {
      icon: GitMerge,
      description: 'An interactive guide to selecting the right propagation or fading model.'
    },
    'scenarios': {
      icon: Briefcase,
      description: 'Practical case studies like 5G mmWave design and urban SNR planning.'
    },
    'pitfalls': {
      icon: AlertTriangle,
      description: 'Common mistakes in exams and practice, such as confusing dBW and dBm.'
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-white/10 pb-6">
        <div className="p-3 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-green) 20%, transparent)' }}>
          <Wrench className="w-8 h-8" style={{ color: 'var(--color-accent-green)' }} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Engineer's Toolkit
          </h1>
          <p className="text-white/60">
            Practical resources, decision guides, and real-world scenarios to bridge theory and practice.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {toolkitSection.topics.map((topic) => {
          const details = topicDetails[topic.id] || { icon: Wrench, description: 'Toolkit resource' };
          const Icon = details.icon;
          
          return (
            <Link
              key={topic.id}
              to={topic.path}
              className="glass-panel p-6 rounded-2xl flex flex-col group hover:border-white/20 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Icon className="w-6 h-6" style={{ color: 'var(--color-accent-green)' }} />
                </div>
                <h3 className="text-xl font-semibold text-white/90 group-hover:text-white transition-colors">
                  {topic.title}
                </h3>
              </div>
              <p className="text-sm text-white/60 mb-6 flex-grow">
                {details.description}
              </p>
              <div className="flex items-center text-sm font-medium transition-colors mt-auto" style={{ color: 'var(--color-accent-green)' }}>
                Explore module
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
