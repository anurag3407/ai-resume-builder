import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useResumeStore } from '../store/resumeStore';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { JOB_ROLES, SKILLS, INDUSTRIES, EXPERIENCE_LEVELS } from '../lib/constants';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Star,
  Building,
  MessageSquare,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function PreferencesPage() {
  const navigate = useNavigate();
  const { setPreferences, preferences, extractedText, enhanceResume, isEnhancing } = useResumeStore();
  const [selectedSkills, setSelectedSkills] = useState(preferences.skills || []);
  const [skillSearch, setSkillSearch] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      jobRole: preferences.jobRole || '',
      yearsOfExperience: preferences.yearsOfExperience || 0,
      industry: preferences.industry || '',
      customInstructions: preferences.customInstructions || '',
    },
  });

  // Redirect if no extracted text
  if (!extractedText) {
    navigate('/upload');
    return null;
  }

  const filteredSkills = SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.includes(skill)
  );

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillSearch('');
  };

  const removeSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const onSubmit = async (data) => {
    const prefs = {
      ...data,
      skills: selectedSkills,
    };

    setPreferences(prefs);

    try {
      toast.loading('Enhancing your resume with AI...', { id: 'enhance' });
      await enhanceResume();
      toast.success('Resume enhanced successfully!', { id: 'enhance' });
      navigate('/editor');
    } catch (err) {
      // If AI enhancement fails, use original text and still navigate to editor
      toast.error('AI enhancement failed. Using original text.', { id: 'enhance' });
      // Set enhanced text to extracted text so editor has content
      useResumeStore.getState().setEnhancedText(extractedText);
      navigate('/editor');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="text-sm text-gray-500">Upload</span>
          </div>
          <div className="w-12 h-0.5 bg-blue-600" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="text-sm font-medium text-blue-600">Preferences</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-sm text-gray-500">Enhance</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Job Preferences</CardTitle>
            <CardDescription>
              Tell us about your target role to optimize your resume
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Job Role */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Target Job Role</h3>
              </div>
              <Select
                label="Select the role you're targeting"
                options={JOB_ROLES}
                placeholder="Select a job role..."
                {...register('jobRole', { required: 'Job role is required' })}
                error={errors.jobRole?.message}
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Years of Experience</h3>
              </div>
              <Controller
                name="yearsOfExperience"
                control={control}
                render={({ field }) => (
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      {...field}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>0 years</span>
                      <span className="font-medium text-blue-600">
                        {field.value} {field.value === 1 ? 'year' : 'years'}
                      </span>
                      <span>20+ years</span>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Key Skills to Highlight</h3>
              </div>

              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-blue-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Skill Search */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search and add skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
                {skillSearch && filteredSkills.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSkills.slice(0, 10).map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Add Popular Skills */}
              <div className="flex flex-wrap gap-2 mt-2">
                {SKILLS.slice(0, 8).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    disabled={selectedSkills.includes(skill)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors
                      ${selectedSkills.includes(skill)
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-500 hover:text-blue-600'
                      }`}
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Industry */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Industry Preference (Optional)</h3>
              </div>
              <Select
                options={INDUSTRIES}
                placeholder="Select an industry..."
                {...register('industry')}
              />
            </div>

            {/* Custom Instructions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Additional Instructions (Optional)</h3>
              </div>
              <Textarea
                placeholder="Any specific requirements or preferences for your resume..."
                rows={4}
                {...register('customInstructions')}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/upload')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit" loading={isEnhancing}>
                Enhance with AI
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
