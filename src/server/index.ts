import { bookDemoRouter } from './routers/book-demo/procedure';
import { getStartedRouter } from './routers/get-started/procedure';
import { router } from './trpc';
 import { z } from 'zod';

export const appRouter = router({
   bookDemo: bookDemoRouter,
   getStarted: getStartedRouter,
});
 
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
