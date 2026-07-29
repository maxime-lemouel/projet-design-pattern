import { startApp } from './app.ts';

const root = document.getElementById('app');

if (root) {
  void startApp(root);
}
