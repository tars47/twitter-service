type StatusCode = keyof typeof HttpError.codes;
/**
 * @description -> public contract for HttpError class
 */
export interface HttpErrorObject {
  statusCode: StatusCode;
  error: unknown;
}

/**
 * @description ->  This utility class is used to define a http error
 */
export class HttpError implements HttpErrorObject {
  public statusCode: StatusCode = 500;
  public error;

  /**
   *  @description ->  This constructor is used to define a http error
   */
  constructor(error: unknown, code?: StatusCode) {
    if (error instanceof Error) {
      this.error = { status: "Error", message: error.message };
    } else {
      switch (code) {
        case 400:
          this.error = {
            status: "ValidationError",
            message: "Invalid Data Schema",
            error,
          };
          break;
        case 401:
          this.error = {
            status: "AuthError",
            message: error,
          };
          break;
        default:
          this.error = {
            status: "UnknownError",
            message: "Internal Server Error",
            error,
          };
          break;
      }
    }
    if (code) this.statusCode = code;
  }

  /**
   * @description ->  List of all the HTTP status codes and descriptions
   */
  static codes = {
    100: "CONTINUE",
    101: "SWITCHING_PROTOCOLS",
    102: "PROCESSING",
    200: "OK",
    201: "CREATED",
    202: "ACCEPTED",
    203: "NON_AUTHORITATIVE_INFORMATION",
    204: "NO_CONTENT",
    205: "RESET_CONTENT",
    206: "PARTIAL_CONTENT",
    207: "MULTI_STATUS",
    300: "MULTIPLE_CHOICES",
    301: "MOVED_PERMANENTLY",
    302: "MOVED_TEMPORARILY",
    303: "SEE_OTHER",
    304: "NOT_MODIFIED",
    305: "USE_PROXY",
    307: "TEMPORARY_REDIRECT",
    308: "PERMANENT_REDIRECT",
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    402: "PAYMENT_REQUIRED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    406: "NOT_ACCEPTABLE",
    407: "PROXY_AUTHENTICATION_REQUIRED",
    408: "REQUEST_TIMEOUT",
    409: "CONFLICT",
    410: "GONE",
    411: "LENGTH_REQUIRED",
    412: "PRECONDITION_FAILED",
    413: "REQUEST_TOO_LONG",
    414: "REQUEST_URI_TOO_LONG",
    415: "UNSUPPORTED_MEDIA_TYPE",
    416: "REQUESTED_RANGE_NOT_SATISFIABLE",
    417: "EXPECTATION_FAILED",
    418: "IM_A_TEAPOT",
    419: "INSUFFICIENT_SPACE_ON_RESOURCE",
    420: "METHOD_FAILURE",
    421: "MISDIRECTED_REQUEST",
    422: "UNPROCESSABLE_ENTITY",
    423: "LOCKED",
    424: "FAILED_DEPENDENCY",
    428: "PRECONDITION_REQUIRED",
    429: "TOO_MANY_REQUESTS",
    431: "REQUEST_HEADER_FIELDS_TOO_LARGE",
    451: "UNAVAILABLE_FOR_LEGAL_REASONS",
    500: "INTERNAL_SERVER_ERROR",
    501: "NOT_IMPLEMENTED",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT",
    505: "HTTP_VERSION_NOT_SUPPORTED",
    507: "INSUFFICIENT_STORAGE",
    511: "NETWORK_AUTHENTICATION_REQUIRED",
  };
}
