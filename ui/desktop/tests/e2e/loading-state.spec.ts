import { test, expect } from './fixtures';

test.describe('Loading State', () => {
  test('shows a model placeholder while creating a new chat session', async ({ cryonPage }) => {
    await cryonPage.waitForSelector('[data-testid="chat-input"]', { timeout: 30000 });

    const chatInput = await cryonPage.waitForSelector('[data-testid="chat-input"]');
    await chatInput.fill('Respond with the single word hello.');
    await chatInput.press('Enter');

    await cryonPage.waitForSelector('[data-testid="loading-indicator"]', {
      state: 'visible',
      timeout: 10000,
    });

    const loadingModel = cryonPage.locator('[data-testid="model-loading-state"]');
    await expect(loadingModel).toHaveText(/loading model/i, { timeout: 10000 });

    await cryonPage.screenshot({
      path: test.info().outputPath('loading-state-fresh-session.png'),
      fullPage: true,
    });
  });
});
