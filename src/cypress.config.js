import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
        baseUrl: 'http://localhost',
    projectId: "ac8eim", 
    supportFile: false,
    video: true,
    screenshotOnRunFailure: true
    // setupNodeEvents(on, config) {
    //   // implement node event listeners here
    // },
  },
});
