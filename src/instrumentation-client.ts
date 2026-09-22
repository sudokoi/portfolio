import * as Sentry from '@sentry/nextjs';
import { sentryOptions } from './shared/config/sentry';

if (sentryOptions.enabled) Sentry.init(sentryOptions);
