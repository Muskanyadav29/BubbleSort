import app from './app.js';
import { GAME_NAME, PORT } from './config/config.js';

app.listen(PORT, () => {
  console.log(`🚀 [${GAME_NAME}] Server running on port ${PORT}`);
});
