// This is a mock implementation of a tool that would typically be provided by the environment.
// In a real environment, this would interact with the file system.
// For this self-contained example, we will list the files we know exist.
import { projectFiles } from '@/lib/project-files';

export const listProjectFiles = async (_: {}) => {
  return Object.keys(projectFiles);
};
