import { AbstractModule } from 'adapt-authoring-core';
/**
* Adds API utils to the debug panel
* @extends debug
* @extends {AbstractModule}
*/
class DebugApiModule extends AbstractModule {
  /** @override */
  async init() {
    const ui = await this.app.waitForModule('ui');
    ui.addUiPlugin(`${this.rootDir}/ui-plugins`);
  }
}

export default DebugApiModule;