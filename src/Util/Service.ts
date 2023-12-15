/**
 * @description ->  This class defines the nature of this container
 *                  and implements process callbacks.
 */
export default class Service {
  static _name = `twitter`;
  static port = process.env.PORT;
  static limit = { limit: "32mb" };
  static env = process.env.NODE_ENV;

  /**
   * @description ->  callback for uncaughtException event
   */
  static uce(e: Error): never {
    console.error("There was an uncaught error...", e);
    process.exit(1);
  }

  /**
   * @description ->  callback for unhandledRejection event
   */
  static uhr(r: any, p: Promise<any>): never {
    console.error("Unhandled Rejection at:", p, "reason:", r);
    process.exit(1);
  }

  /**
   * @description ->  callback for warning event
   */
  static warning(w: any): void {
    console.warn("Warning...", w);
  }

  /**
   * @description ->  callback for exit event
   */
  static exit(c: any) {
    console.log(`Process exited with code ${c}...`);
  }

  /**
   * @description ->  callback for SIGTERM event
   */
  static sigterm() {
    console.log(`Received SIGTERM signal, shutting down gracefully...`);
    process.exit(0);
  }

  /**
   * @description ->  callback for SIGHUP event
   */
  static sighup() {
    console.log(`Received SIGHUP signal, reloading configuration...`);
  }

  /**
   * @description ->  callback for listen event
   */
  static listen() {
    console.log(`<----------${Service._name} service is alive on port:${Service.port}---------->`);
  }

  /**
   * @description -> async class method that can retry a rejected promise r number of times.
   */
  static async retry(f: () => any, r: number): Promise<any> {
    try {
      if (r > 0) return await f();
      else return "r should be >0";
    } catch (e) {
      if (r - 1 > 0) return await this.retry(f, r - 1);
      else return Promise.reject(e);
    }
  }
}
