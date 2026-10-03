import { loadConfig } from '../config/app-config';
import { createDataSource } from './data-source';

// Only the TypeORM CLI loads this module; application composition stays side-effect free.
export default createDataSource(loadConfig());
