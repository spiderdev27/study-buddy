import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/theme-selector';

interface TemplatePanelProps {
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  nodes: Array<{
    id: string;
    text: string;
    x: number;
    y: number;
    color: string;
    type: 'main' | 'sub' | 'leaf';
  }>;
  links: Array<{
    id: string;
    source: string;
    target: string;
  }>;
}

const templates: Template[] = [
  {
    id: 'study-plan',
    title: 'Study Plan',
    description: 'Organize your study schedule and track progress',
    category: 'Academic',
    nodes: [
      { id: 'root', text: 'Study Plan', x: 400, y: 200, color: '#4338CA', type: 'main' },
      { id: 'sub1', text: 'Daily Tasks', x: 200, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub2', text: 'Weekly Goals', x: 400, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub3', text: 'Monthly Objectives', x: 600, y: 300, color: '#047857', type: 'sub' },
      { id: 'leaf1', text: 'Review Previous Notes', x: 100, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf2', text: 'Complete Practice Problems', x: 200, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf3', text: 'Summarize Key Concepts', x: 300, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf4', text: 'Master 2 Topics', x: 400, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf5', text: 'Complete Mock Quiz', x: 500, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf6', text: 'Group Study Session', x: 600, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf7', text: 'Track Progress & Adjust', x: 700, y: 400, color: '#B45309', type: 'leaf' },
      
      // Additional nodes
      { id: 'sub4', text: 'Resources', x: 200, y: 500, color: '#047857', type: 'sub' },
      { id: 'leaf8', text: 'Textbooks', x: 100, y: 600, color: '#B45309', type: 'leaf' },
      { id: 'leaf9', text: 'Online Courses', x: 200, y: 600, color: '#B45309', type: 'leaf' },
      { id: 'leaf10', text: 'Study Groups', x: 300, y: 600, color: '#B45309', type: 'leaf' }
    ],
    links: [
      { id: 'l1', source: 'root', target: 'sub1' },
      { id: 'l2', source: 'root', target: 'sub2' },
      { id: 'l3', source: 'root', target: 'sub3' },
      { id: 'l4', source: 'sub1', target: 'leaf1' },
      { id: 'l5', source: 'sub1', target: 'leaf2' },
      { id: 'l6', source: 'sub1', target: 'leaf3' },
      { id: 'l7', source: 'sub2', target: 'leaf4' },
      { id: 'l8', source: 'sub2', target: 'leaf5' },
      { id: 'l9', source: 'sub3', target: 'leaf6' },
      { id: 'l10', source: 'sub3', target: 'leaf7' },
      
      // Additional links
      { id: 'l11', source: 'root', target: 'sub4' },
      { id: 'l12', source: 'sub4', target: 'leaf8' },
      { id: 'l13', source: 'sub4', target: 'leaf9' },
      { id: 'l14', source: 'sub4', target: 'leaf10' }
    ]
  },
  {
    id: 'research-paper',
    title: 'Research Paper',
    description: 'Structure your research paper ideas and findings',
    category: 'Academic',
    nodes: [
      { id: 'root', text: 'Research Paper', x: 400, y: 200, color: '#4338CA', type: 'main' },
      { id: 'sub1', text: 'Introduction', x: 200, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub2', text: 'Methodology', x: 400, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub3', text: 'Results & Discussion', x: 600, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub4', text: 'Literature Review', x: 200, y: 400, color: '#047857', type: 'sub' },
      
      { id: 'leaf1', text: 'Thesis Statement', x: 100, y: 350, color: '#B45309', type: 'leaf' },
      { id: 'leaf2', text: 'Research Problem', x: 150, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf3', text: 'Significance', x: 300, y: 350, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf4', text: 'Data Collection', x: 350, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf5', text: 'Analysis Approach', x: 400, y: 450, color: '#B45309', type: 'leaf' },
      { id: 'leaf6', text: 'Research Design', x: 450, y: 400, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf7', text: 'Key Findings', x: 550, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf8', text: 'Interpretation', x: 600, y: 450, color: '#B45309', type: 'leaf' },
      { id: 'leaf9', text: 'Limitations', x: 650, y: 400, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf10', text: 'Historical Context', x: 150, y: 450, color: '#B45309', type: 'leaf' },
      { id: 'leaf11', text: 'Current Theories', x: 200, y: 500, color: '#B45309', type: 'leaf' },
      { id: 'leaf12', text: 'Gaps in Research', x: 250, y: 450, color: '#B45309', type: 'leaf' },
      
      { id: 'sub5', text: 'Conclusion', x: 400, y: 550, color: '#047857', type: 'sub' },
      { id: 'leaf13', text: 'Summary', x: 350, y: 600, color: '#B45309', type: 'leaf' },
      { id: 'leaf14', text: 'Implications', x: 400, y: 650, color: '#B45309', type: 'leaf' },
      { id: 'leaf15', text: 'Future Research', x: 450, y: 600, color: '#B45309', type: 'leaf' }
    ],
    links: [
      { id: 'l1', source: 'root', target: 'sub1' },
      { id: 'l2', source: 'root', target: 'sub2' },
      { id: 'l3', source: 'root', target: 'sub3' },
      { id: 'l4', source: 'root', target: 'sub4' },
      
      { id: 'l5', source: 'sub1', target: 'leaf1' },
      { id: 'l6', source: 'sub1', target: 'leaf2' },
      { id: 'l7', source: 'sub1', target: 'leaf3' },
      
      { id: 'l8', source: 'sub2', target: 'leaf4' },
      { id: 'l9', source: 'sub2', target: 'leaf5' },
      { id: 'l10', source: 'sub2', target: 'leaf6' },
      
      { id: 'l11', source: 'sub3', target: 'leaf7' },
      { id: 'l12', source: 'sub3', target: 'leaf8' },
      { id: 'l13', source: 'sub3', target: 'leaf9' },
      
      { id: 'l14', source: 'sub4', target: 'leaf10' },
      { id: 'l15', source: 'sub4', target: 'leaf11' },
      { id: 'l16', source: 'sub4', target: 'leaf12' },
      
      { id: 'l17', source: 'root', target: 'sub5' },
      { id: 'l18', source: 'sub5', target: 'leaf13' },
      { id: 'l19', source: 'sub5', target: 'leaf14' },
      { id: 'l20', source: 'sub5', target: 'leaf15' }
    ]
  },
  {
    id: 'course-concepts',
    title: 'Course Concepts',
    description: 'Map out the key concepts from a course or subject',
    category: 'Learning',
    nodes: [
      { id: 'root', text: 'Course Name', x: 400, y: 200, color: '#4338CA', type: 'main' },
      
      { id: 'sub1', text: 'Unit 1', x: 200, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub2', text: 'Unit 2', x: 400, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub3', text: 'Unit 3', x: 600, y: 300, color: '#047857', type: 'sub' },
      
      { id: 'leaf1', text: 'Key Concept 1.1', x: 150, y: 380, color: '#B45309', type: 'leaf' },
      { id: 'leaf2', text: 'Key Concept 1.2', x: 200, y: 420, color: '#B45309', type: 'leaf' },
      { id: 'leaf3', text: 'Key Concept 1.3', x: 250, y: 380, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf4', text: 'Key Concept 2.1', x: 350, y: 380, color: '#B45309', type: 'leaf' },
      { id: 'leaf5', text: 'Key Concept 2.2', x: 400, y: 420, color: '#B45309', type: 'leaf' },
      { id: 'leaf6', text: 'Key Concept 2.3', x: 450, y: 380, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf7', text: 'Key Concept 3.1', x: 550, y: 380, color: '#B45309', type: 'leaf' },
      { id: 'leaf8', text: 'Key Concept 3.2', x: 600, y: 420, color: '#B45309', type: 'leaf' },
      { id: 'leaf9', text: 'Key Concept 3.3', x: 650, y: 380, color: '#B45309', type: 'leaf' },
      
      { id: 'sub4', text: 'Resources', x: 300, y: 500, color: '#047857', type: 'sub' },
      { id: 'sub5', text: 'Assignments', x: 500, y: 500, color: '#047857', type: 'sub' },
      
      { id: 'leaf10', text: 'Textbooks', x: 250, y: 580, color: '#B45309', type: 'leaf' },
      { id: 'leaf11', text: 'Online Lectures', x: 300, y: 600, color: '#B45309', type: 'leaf' },
      { id: 'leaf12', text: 'Study Groups', x: 350, y: 580, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf13', text: 'Papers', x: 450, y: 580, color: '#B45309', type: 'leaf' },
      { id: 'leaf14', text: 'Projects', x: 500, y: 600, color: '#B45309', type: 'leaf' },
      { id: 'leaf15', text: 'Exams', x: 550, y: 580, color: '#B45309', type: 'leaf' }
    ],
    links: [
      { id: 'l1', source: 'root', target: 'sub1' },
      { id: 'l2', source: 'root', target: 'sub2' },
      { id: 'l3', source: 'root', target: 'sub3' },
      
      { id: 'l4', source: 'sub1', target: 'leaf1' },
      { id: 'l5', source: 'sub1', target: 'leaf2' },
      { id: 'l6', source: 'sub1', target: 'leaf3' },
      
      { id: 'l7', source: 'sub2', target: 'leaf4' },
      { id: 'l8', source: 'sub2', target: 'leaf5' },
      { id: 'l9', source: 'sub2', target: 'leaf6' },
      
      { id: 'l10', source: 'sub3', target: 'leaf7' },
      { id: 'l11', source: 'sub3', target: 'leaf8' },
      { id: 'l12', source: 'sub3', target: 'leaf9' },
      
      { id: 'l13', source: 'root', target: 'sub4' },
      { id: 'l14', source: 'root', target: 'sub5' },
      
      { id: 'l15', source: 'sub4', target: 'leaf10' },
      { id: 'l16', source: 'sub4', target: 'leaf11' },
      { id: 'l17', source: 'sub4', target: 'leaf12' },
      
      { id: 'l18', source: 'sub5', target: 'leaf13' },
      { id: 'l19', source: 'sub5', target: 'leaf14' },
      { id: 'l20', source: 'sub5', target: 'leaf15' }
    ]
  },
  {
    id: 'project-planning',
    title: 'Project Planning',
    description: 'Organize project tasks, milestones, and resources',
    category: 'Project Management',
    nodes: [
      { id: 'root', text: 'Project Plan', x: 400, y: 200, color: '#4338CA', type: 'main' },
      
      { id: 'sub1', text: 'Project Phases', x: 250, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub2', text: 'Resources', x: 400, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub3', text: 'Timeline', x: 550, y: 300, color: '#047857', type: 'sub' },
      
      { id: 'leaf1', text: 'Planning', x: 150, y: 370, color: '#B45309', type: 'leaf' },
      { id: 'leaf2', text: 'Research', x: 200, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf3', text: 'Development', x: 250, y: 430, color: '#B45309', type: 'leaf' },
      { id: 'leaf4', text: 'Testing', x: 300, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf5', text: 'Deployment', x: 350, y: 370, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf6', text: 'Team Members', x: 350, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf7', text: 'Budget', x: 400, y: 430, color: '#B45309', type: 'leaf' },
      { id: 'leaf8', text: 'Tools', x: 450, y: 400, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf9', text: 'Start Date', x: 500, y: 370, color: '#B45309', type: 'leaf' },
      { id: 'leaf10', text: 'Milestones', x: 550, y: 400, color: '#B45309', type: 'leaf' },
      { id: 'leaf11', text: 'Deadlines', x: 600, y: 370, color: '#B45309', type: 'leaf' },
      
      { id: 'sub4', text: 'Stakeholders', x: 250, y: 500, color: '#047857', type: 'sub' },
      { id: 'sub5', text: 'Risks & Challenges', x: 550, y: 500, color: '#047857', type: 'sub' },
      
      { id: 'leaf12', text: 'Client', x: 200, y: 570, color: '#B45309', type: 'leaf' },
      { id: 'leaf13', text: 'Team', x: 250, y: 600, color: '#B45309', type: 'leaf' },
      { id: 'leaf14', text: 'Managers', x: 300, y: 570, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf15', text: 'Technical Issues', x: 500, y: 570, color: '#B45309', type: 'leaf' },
      { id: 'leaf16', text: 'Resource Constraints', x: 550, y: 600, color: '#B45309', type: 'leaf' },
      { id: 'leaf17', text: 'Schedule Delays', x: 600, y: 570, color: '#B45309', type: 'leaf' }
    ],
    links: [
      { id: 'l1', source: 'root', target: 'sub1' },
      { id: 'l2', source: 'root', target: 'sub2' },
      { id: 'l3', source: 'root', target: 'sub3' },
      
      { id: 'l4', source: 'sub1', target: 'leaf1' },
      { id: 'l5', source: 'sub1', target: 'leaf2' },
      { id: 'l6', source: 'sub1', target: 'leaf3' },
      { id: 'l7', source: 'sub1', target: 'leaf4' },
      { id: 'l8', source: 'sub1', target: 'leaf5' },
      
      { id: 'l9', source: 'sub2', target: 'leaf6' },
      { id: 'l10', source: 'sub2', target: 'leaf7' },
      { id: 'l11', source: 'sub2', target: 'leaf8' },
      
      { id: 'l12', source: 'sub3', target: 'leaf9' },
      { id: 'l13', source: 'sub3', target: 'leaf10' },
      { id: 'l14', source: 'sub3', target: 'leaf11' },
      
      { id: 'l15', source: 'root', target: 'sub4' },
      { id: 'l16', source: 'root', target: 'sub5' },
      
      { id: 'l17', source: 'sub4', target: 'leaf12' },
      { id: 'l18', source: 'sub4', target: 'leaf13' },
      { id: 'l19', source: 'sub4', target: 'leaf14' },
      
      { id: 'l20', source: 'sub5', target: 'leaf15' },
      { id: 'l21', source: 'sub5', target: 'leaf16' },
      { id: 'l22', source: 'sub5', target: 'leaf17' }
    ]
  },
  {
    id: 'essay-outline',
    title: 'Essay Outline',
    description: 'Create a structured outline for your essay or paper',
    category: 'Writing',
    nodes: [
      { id: 'root', text: 'Essay Topic', x: 400, y: 200, color: '#4338CA', type: 'main' },
      
      { id: 'sub1', text: 'Introduction', x: 200, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub2', text: 'Body Paragraphs', x: 400, y: 300, color: '#047857', type: 'sub' },
      { id: 'sub3', text: 'Conclusion', x: 600, y: 300, color: '#047857', type: 'sub' },
      
      { id: 'leaf1', text: 'Hook/Attention Grabber', x: 120, y: 380, color: '#B45309', type: 'leaf' },
      { id: 'leaf2', text: 'Background Information', x: 200, y: 420, color: '#B45309', type: 'leaf' },
      { id: 'leaf3', text: 'Thesis Statement', x: 280, y: 380, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf4', text: 'Topic Sentence 1', x: 320, y: 380, color: '#B45309', type: 'leaf' },
      { id: 'leaf5', text: 'Supporting Evidence', x: 400, y: 420, color: '#B45309', type: 'leaf' },
      { id: 'leaf6', text: 'Analysis', x: 400, y: 460, color: '#B45309', type: 'leaf' },
      { id: 'leaf7', text: 'Topic Sentence 2', x: 400, y: 500, color: '#B45309', type: 'leaf' },
      { id: 'leaf8', text: 'Topic Sentence 3', x: 480, y: 380, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf9', text: 'Restate Thesis', x: 520, y: 380, color: '#B45309', type: 'leaf' },
      { id: 'leaf10', text: 'Summarize Key Points', x: 600, y: 420, color: '#B45309', type: 'leaf' },
      { id: 'leaf11', text: 'Final Thought/Call to Action', x: 680, y: 380, color: '#B45309', type: 'leaf' },
      
      { id: 'sub4', text: 'Research & Sources', x: 200, y: 550, color: '#047857', type: 'sub' },
      { id: 'sub5', text: 'Revision Strategy', x: 600, y: 550, color: '#047857', type: 'sub' },
      
      { id: 'leaf12', text: 'Primary Sources', x: 150, y: 620, color: '#B45309', type: 'leaf' },
      { id: 'leaf13', text: 'Secondary Sources', x: 200, y: 660, color: '#B45309', type: 'leaf' },
      { id: 'leaf14', text: 'Citation Format', x: 250, y: 620, color: '#B45309', type: 'leaf' },
      
      { id: 'leaf15', text: 'Content Check', x: 550, y: 620, color: '#B45309', type: 'leaf' },
      { id: 'leaf16', text: 'Structure Review', x: 600, y: 660, color: '#B45309', type: 'leaf' },
      { id: 'leaf17', text: 'Grammar & Style', x: 650, y: 620, color: '#B45309', type: 'leaf' }
    ],
    links: [
      { id: 'l1', source: 'root', target: 'sub1' },
      { id: 'l2', source: 'root', target: 'sub2' },
      { id: 'l3', source: 'root', target: 'sub3' },
      
      { id: 'l4', source: 'sub1', target: 'leaf1' },
      { id: 'l5', source: 'sub1', target: 'leaf2' },
      { id: 'l6', source: 'sub1', target: 'leaf3' },
      
      { id: 'l7', source: 'sub2', target: 'leaf4' },
      { id: 'l8', source: 'sub2', target: 'leaf5' },
      { id: 'l9', source: 'sub2', target: 'leaf6' },
      { id: 'l10', source: 'sub2', target: 'leaf7' },
      { id: 'l11', source: 'sub2', target: 'leaf8' },
      
      { id: 'l12', source: 'sub3', target: 'leaf9' },
      { id: 'l13', source: 'sub3', target: 'leaf10' },
      { id: 'l14', source: 'sub3', target: 'leaf11' },
      
      { id: 'l15', source: 'root', target: 'sub4' },
      { id: 'l16', source: 'root', target: 'sub5' },
      
      { id: 'l17', source: 'sub4', target: 'leaf12' },
      { id: 'l18', source: 'sub4', target: 'leaf13' },
      { id: 'l19', source: 'sub4', target: 'leaf14' },
      
      { id: 'l20', source: 'sub5', target: 'leaf15' },
      { id: 'l21', source: 'sub5', target: 'leaf16' },
      { id: 'l22', source: 'sub5', target: 'leaf17' }
    ]
  }
];

export default function TemplatePanel({ onClose, onSelectTemplate }: TemplatePanelProps) {
  const { colors } = useTheme();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-bg-card border border-white/10 rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-bold">Choose a Template</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{template.title}</h3>
                  <span className="text-xs text-text-secondary">{template.category}</span>
                </div>
                <p className="text-sm text-text-secondary">{template.description}</p>
                <div className="mt-3 flex items-center text-xs text-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Click to use template
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
} 