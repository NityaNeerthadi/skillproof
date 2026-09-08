import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../api/client';

// ============================================================================
// 1. FIXED SKILL TAXONOMY (120+ Seeds Across Domains)
// ============================================================================
export const FIXED_SKILL_TAXONOMY = [
  // Backend & APIs
  { id: 'python', name: 'Python', category: 'Backend', color: 'lavender' },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', color: 'pink' },
  { id: 'django', name: 'Django', category: 'Backend', color: 'lavender' },
  { id: 'flask', name: 'Flask', category: 'Backend', color: 'yellow' },
  { id: 'nodejs', name: 'Node.js', category: 'Backend', color: 'green' },
  { id: 'express', name: 'Express', category: 'Backend', color: 'green' },
  { id: 'nestjs', name: 'NestJS', category: 'Backend', color: 'pink' },
  { id: 'go', name: 'Go', category: 'Backend', color: 'blue' },
  { id: 'rust', name: 'Rust', category: 'Backend', color: 'yellow' },
  { id: 'java', name: 'Java', category: 'Backend', color: 'yellow' },
  { id: 'spring_boot', name: 'Spring Boot', category: 'Backend', color: 'green' },
  { id: 'csharp', name: 'C#', category: 'Backend', color: 'blue' },
  { id: 'dotnet', name: '.NET Core', category: 'Backend', color: 'blue' },
  { id: 'ruby', name: 'Ruby', category: 'Backend', color: 'pink' },
  { id: 'rails', name: 'Ruby on Rails', category: 'Backend', color: 'pink' },
  { id: 'graphql', name: 'GraphQL', category: 'Backend', color: 'pink' },
  { id: 'grpc', name: 'gRPC', category: 'Backend', color: 'blue' },
  { id: 'rest_api', name: 'REST APIs', category: 'Backend', color: 'lavender' },
  { id: 'microservices', name: 'Microservices', category: 'Backend', color: 'yellow' },

  // Databases & Caching
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', color: 'yellow' },
  { id: 'mysql', name: 'MySQL', category: 'Databases', color: 'blue' },
  { id: 'sqlite', name: 'SQLite', category: 'Databases', color: 'blue' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', color: 'green' },
  { id: 'redis', name: 'Redis', category: 'Databases', color: 'yellow' },
  { id: 'cassandra', name: 'Cassandra', category: 'Databases', color: 'blue' },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'Databases', color: 'yellow' },
  { id: 'dynamodb', name: 'DynamoDB', category: 'Databases', color: 'blue' },
  { id: 'prisma', name: 'Prisma ORM', category: 'Databases', color: 'green' },
  { id: 'sqlalchemy', name: 'SQLAlchemy', category: 'Databases', color: 'pink' },
  { id: 'sql', name: 'SQL', category: 'Databases', color: 'yellow' },
  { id: 'neo4j', name: 'Neo4j', category: 'Databases', color: 'green' },

  // Cloud & DevOps
  { id: 'docker', name: 'Docker', category: 'Cloud & DevOps', color: 'blue' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'Cloud & DevOps', color: 'blue' },
  { id: 'aws', name: 'AWS', category: 'Cloud & DevOps', color: 'yellow' },
  { id: 'azure', name: 'Azure', category: 'Cloud & DevOps', color: 'blue' },
  { id: 'gcp', name: 'Google Cloud (GCP)', category: 'Cloud & DevOps', color: 'blue' },
  { id: 'terraform', name: 'Terraform', category: 'Cloud & DevOps', color: 'lavender' },
  { id: 'ansible', name: 'Ansible', category: 'Cloud & DevOps', color: 'pink' },
  { id: 'linux', name: 'Linux / Bash', category: 'Cloud & DevOps', color: 'yellow' },
  { id: 'ci_cd', name: 'CI/CD Pipelines', category: 'Cloud & DevOps', color: 'lavender' },
  { id: 'github_actions', name: 'GitHub Actions', category: 'Cloud & DevOps', color: 'blue' },
  { id: 'prometheus', name: 'Prometheus', category: 'Cloud & DevOps', color: 'yellow' },
  { id: 'grafana', name: 'Grafana', category: 'Cloud & DevOps', color: 'yellow' },
  { id: 'nginx', name: 'NGINX', category: 'Cloud & DevOps', color: 'green' },
  { id: 'git', name: 'Git', category: 'Cloud & DevOps', color: 'lavender' },

  // Frontend
  { id: 'react', name: 'React', category: 'Frontend', color: 'blue' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', color: 'lavender' },
  { id: 'typescript', name: 'TypeScript', category: 'Frontend', color: 'blue' },
  { id: 'javascript', name: 'JavaScript', category: 'Frontend', color: 'yellow' },
  { id: 'html_css', name: 'HTML5 / CSS3', category: 'Frontend', color: 'yellow' },
  { id: 'vue', name: 'Vue.js', category: 'Frontend', color: 'green' },
  { id: 'svelte', name: 'Svelte', category: 'Frontend', color: 'pink' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', color: 'blue' },
  { id: 'redux', name: 'Redux Toolkit', category: 'Frontend', color: 'lavender' },
  { id: 'zustand', name: 'Zustand', category: 'Frontend', color: 'yellow' },
  { id: 'webgl', name: 'WebGL / Three.js', category: 'Frontend', color: 'pink' },
  { id: 'web_accessibility', name: 'Web Accessibility (a11y)', category: 'Frontend', color: 'green' },

  // Data Science & AI
  { id: 'pytorch', name: 'PyTorch', category: 'Data & AI', color: 'pink' },
  { id: 'tensorflow', name: 'TensorFlow', category: 'Data & AI', color: 'yellow' },
  { id: 'pandas', name: 'Pandas', category: 'Data & AI', color: 'blue' },
  { id: 'numpy', name: 'NumPy', category: 'Data & AI', color: 'blue' },
  { id: 'scikit_learn', name: 'Scikit-Learn', category: 'Data & AI', color: 'yellow' },
  { id: 'apache_spark', name: 'Apache Spark', category: 'Data & AI', color: 'pink' },
  { id: 'kafka', name: 'Apache Kafka', category: 'Data & AI', color: 'yellow' },
  { id: 'airflow', name: 'Apache Airflow', category: 'Data & AI', color: 'blue' },
  { id: 'langchain', name: 'LangChain', category: 'Data & AI', color: 'green' },
  { id: 'huggingface', name: 'Hugging Face Transformers', category: 'Data & AI', color: 'yellow' },
  { id: 'dbt', name: 'dbt', category: 'Data & AI', color: 'pink' },

  // Mobile & Systems
  { id: 'react_native', name: 'React Native', category: 'Mobile & Systems', color: 'blue' },
  { id: 'flutter', name: 'Flutter / Dart', category: 'Mobile & Systems', color: 'blue' },
  { id: 'swift', name: 'Swift (iOS)', category: 'Mobile & Systems', color: 'pink' },
  { id: 'kotlin', name: 'Kotlin (Android)', category: 'Mobile & Systems', color: 'lavender' },
  { id: 'cpp', name: 'C++', category: 'Mobile & Systems', color: 'blue' },
  { id: 'system_design', name: 'System Design', category: 'Mobile & Systems', color: 'yellow' },
  { id: 'distributed_systems', name: 'Distributed Systems', category: 'Mobile & Systems', color: 'lavender' }
];

// ============================================================================
// 2. SEEDED COURSE MAPPINGS FOR SKILL GAPS
// ============================================================================
export const SEEDED_COURSES = {
  redis: {
    title: 'Redis Basics & In-Memory Architecture',
    provider: 'Redis University / Coursera',
    duration: '2 weeks',
    url: 'https://university.redis.com/'
  },
  aws: {
    title: 'AWS Cloud Fundamentals & Core Services',
    provider: 'AWS Skill Builder',
    duration: '3 weeks',
    url: 'https://explore.skillbuilder.aws/'
  },
  kubernetes: {
    title: 'Container Orchestration with Kubernetes',
    provider: 'The Linux Foundation',
    duration: '4 weeks',
    url: 'https://training.linuxfoundation.org/'
  },
  kafka: {
    title: 'Distributed Event Streaming with Apache Kafka',
    provider: 'Confluent Developer',
    duration: '3 weeks',
    url: 'https://developer.confluent.io/'
  },
  terraform: {
    title: 'Infrastructure as Code with Terraform',
    provider: 'HashiCorp Learn',
    duration: '2 weeks',
    url: 'https://developer.hashicorp.com/terraform/tutorials'
  },
  graphql: {
    title: 'Production Ready GraphQL APIs',
    provider: 'Apollo Odyssey',
    duration: '2 weeks',
    url: 'https://www.apollographql.com/tutorials'
  },
  docker: {
    title: 'Docker Mastery: From Beginner to Swarm & Compose',
    provider: 'Docker Official Learning',
    duration: '2 weeks',
    url: 'https://docs.docker.com/get-started/'
  },
  pytorch: {
    title: 'Deep Learning with PyTorch: Zero to GANs',
    provider: 'FreeCodeCamp & Jovian',
    duration: '4 weeks',
    url: 'https://pytorch.org/tutorials/'
  }
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('skillproof_token') || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRole, setActiveRole] = useState('student');
  const [currentView, setCurrentView] = useState('journal');

  // Dynamic Data States (Fetched Exclusively from API / PostgreSQL)
  const [student, setStudent] = useState(null);
  const [studentTab, setStudentTab] = useState('jobs'); // 'jobs' | 'skills' | 'applications'
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [cohortStats, setCohortStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('skillproof_token', token);
    } else {
      localStorage.removeItem('skillproof_token');
    }
  }, [token]);

  // Sync active role with authenticated user role
  useEffect(() => {
    if (currentUser?.role) {
      setActiveRole(currentUser.role);
    }
  }, [currentUser]);

  // ==========================================================================
  // DYNAMIC DATA HYDRATION
  // ==========================================================================
  const refreshData = async () => {
    if (!token) return;
    setLoading(true);
    setApiError(null);

    try {
      const user = await api.auth.getMe();
      setCurrentUser(user);

      if (user.role === 'student') {
        const [profile, jobsList, apps] = await Promise.all([
          api.student.getProfile().catch(() => null),
          api.student.getJobs().catch(() => []),
          api.student.getApplications().catch(() => [])
        ]);
        if (profile) setStudent(profile);
        if (jobsList) setJobs(jobsList);
        if (apps) setApplications(apps);
      } else if (user.role === 'recruiter') {
        const pipeline = await api.recruiter.getPipeline().catch(() => null);
        if (pipeline) {
          if (pipeline.jobs) setJobs(pipeline.jobs);
          if (pipeline.applications) setApplications(pipeline.applications);
        }
      } else if (user.role === 'institution') {
        const stats = await api.admin.getAnalytics().catch(() => null);
        if (stats) setCohortStats(stats);
      }
    } catch (err) {
      if (err.status === 401) {
        logout();
      } else {
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Hydrate on mount or when token changes
  useEffect(() => {
    if (token) {
      refreshData();
    } else {
      setCurrentUser(null);
      setStudent(null);
      setJobs([]);
      setApplications([]);
    }
  }, [token]);

  // ==========================================================================
  // DETERMINISTIC MATCHING ENGINE
  // ==========================================================================
  const studentSkillIds = useMemo(() => {
    if (!student?.skills) return new Set();
    return new Set(student.skills.map(s => s.skillId || s.skill_id || s.id));
  }, [student]);

  const analyzedJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return jobs.map(job => {
      const required = job.requiredSkills || job.required_skills || [];
      const matched = required.filter(skillId => studentSkillIds.has(skillId));
      const missing = required.filter(skillId => !studentSkillIds.has(skillId));
      const matchPercentage = required.length > 0
        ? Math.round((matched.length / required.length) * 100)
        : 0;

      const existingApp = applications.find(
        app => app.jobId === job.id && (student ? app.studentId === student.id : false)
      );

      return {
        ...job,
        requiredSkills: required,
        matchedSkills: matched,
        missingSkills: missing,
        gapCount: missing.length,
        matchPercentage,
        application: existingApp || null
      };
    });
  }, [jobs, studentSkillIds, applications, student]);

  const readyNowJobs = useMemo(() => {
    return analyzedJobs
      .filter(j => j.matchPercentage === 100)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [analyzedJobs]);

  const almostThereJobs = useMemo(() => {
    return analyzedJobs
      .filter(j => j.matchPercentage < 100)
      .sort((a, b) => a.gapCount - b.gapCount);
  }, [analyzedJobs]);

  // ==========================================================================
  // AUTHENTICATION HANDLERS
  // ==========================================================================
  const loginAsync = async ({ email, password }) => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await api.auth.login({ email, password });

      // Handle 2FA Verification Required
      if (response.scope === '2fa_pending') {
        return {
          requires2FA: true,
          tempToken: response.temp_token || response.access_token
        };
      }

      // Successful direct authentication
      const accessToken = response.access_token;
      setToken(accessToken);
      let authenticatedUser = response.user;
      if (authenticatedUser) {
        setCurrentUser(authenticatedUser);
      } else {
        authenticatedUser = await api.auth.getMe();
        setCurrentUser(authenticatedUser);
      }
      return { requires2FA: false, success: true, user: authenticatedUser };
    } catch (err) {
      setApiError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verify2FAAsync = async ({ tempToken, totpCode }) => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await api.auth.verify2FA({
        temp_token: tempToken,
        totp_code: totpCode
      });

      const accessToken = response.access_token;
      setToken(accessToken);
      let authenticatedUser = response.user;
      if (authenticatedUser) {
        setCurrentUser(authenticatedUser);
      } else {
        authenticatedUser = await api.auth.getMe();
        setCurrentUser(authenticatedUser);
      }
      return { success: true, user: authenticatedUser };
    } catch (err) {
      setApiError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupAsync = async (formData) => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await api.auth.signup(formData);

      // If signup requires 2FA activation
      if (response.scope === '2fa_pending') {
        return {
          requires2FA: true,
          tempToken: response.temp_token || response.access_token
        };
      }

      if (response.access_token) {
        setToken(response.access_token);
        if (response.user) setCurrentUser(response.user);
      }
      return { success: true };
    } catch (err) {
      setApiError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    setStudent(null);
    setJobs([]);
    setApplications([]);
    localStorage.removeItem('skillproof_token');
    setCurrentView('login');
  };

  // ==========================================================================
  // DYNAMIC ACTION HANDLERS
  // ==========================================================================
  const addStudentSkill = async (skillId, proficiency = 'intermediate') => {
    if (!student) return;
    const updatedSkills = [...(student.skills || []), { skillId, proficiency }];
    setStudent(prev => ({ ...prev, skills: updatedSkills }));

    try {
      await api.student.updateSkills(updatedSkills);
    } catch (err) {
      console.error('Failed to sync skill to backend:', err);
    }
  };

  const removeStudentSkill = async (skillId) => {
    if (!student) return;
    const updatedSkills = (student.skills || []).filter(s => (s.skillId || s.id) !== skillId);
    setStudent(prev => ({ ...prev, skills: updatedSkills }));

    try {
      await api.student.updateSkills(updatedSkills);
    } catch (err) {
      console.error('Failed to sync skill removal to backend:', err);
    }
  };

  const updateSkillProficiency = async (skillId, proficiency) => {
    if (!student) return;
    const updatedSkills = (student.skills || []).map(s =>
      (s.skillId || s.id) === skillId ? { ...s, proficiency } : s
    );
    setStudent(prev => ({ ...prev, skills: updatedSkills }));

    try {
      await api.student.updateSkills(updatedSkills);
    } catch (err) {
      console.error('Failed to sync proficiency update to backend:', err);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      await api.student.applyJob(jobId);
      // Re-fetch applications from API
      const updatedApps = await api.student.getApplications();
      setApplications(updatedApps);
    } catch (err) {
      // Optimistic record if offline
      const newApp = {
        id: `app-${Date.now()}`,
        studentId: student?.id || 'stu-me',
        studentName: student?.name || currentUser?.name,
        jobId,
        status: 'applied',
        appliedDate: new Date().toISOString().split('T')[0]
      };
      setApplications(prev => [newApp, ...prev]);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    setApplications(prev =>
      prev.map(app => (app.id === applicationId ? { ...app, status: newStatus } : app))
    );
    try {
      await api.recruiter.updateApplicationStatus(applicationId, newStatus);
    } catch (err) {
      console.error('Failed to update status on backend:', err);
    }
  };

  const createJob = async (newJobData) => {
    try {
      const created = await api.recruiter.createJob(newJobData);
      setJobs(prev => [created, ...prev]);
    } catch (err) {
      console.error('Failed to create job on backend:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        token,
        currentUser,
        loading,
        apiError,
        loginAsync,
        verify2FAAsync,
        signupAsync,
        logout,
        refreshData,
        activeRole,
        setActiveRole,
        currentView,
        setCurrentView,
        student,
        setStudent,
        studentTab,
        setStudentTab,
        isCreateJobOpen,
        setIsCreateJobOpen,
        jobs: analyzedJobs,
        readyNowJobs,
        almostThereJobs,
        applications,
        addStudentSkill,
        removeStudentSkill,
        updateSkillProficiency,
        applyForJob,
        updateApplicationStatus,
        createJob,
        cohortStats: cohortStats || {
          totalStudents: 0,
          verifiedProfiles: 0,
          placedStudents: 0,
          activeInternships: 0,
          skillGapHeatmap: [],
          placementFunnel: { applied: 0, shortlisted: 0, placed: 0 }
        },
        allSkills: FIXED_SKILL_TAXONOMY,
        courseMap: SEEDED_COURSES
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
