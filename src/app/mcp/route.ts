import { mcpRequest } from '@/modules/agents';
export const runtime = 'nodejs';
export const maxDuration = 30;
export { mcpRequest as GET, mcpRequest as POST, mcpRequest as DELETE, mcpRequest as OPTIONS };
