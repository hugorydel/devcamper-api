// Creating a comprehensive Error Response
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    //super - calls the message from the Error class (the purpose of the super() is to have the ability to call methods of extends classes into our own (in this instance ErrorResponse) class)
    //The following super is basically err.message as it goes to the Error (a filled in Error class when applied in the real world) and takes its message
    super(message);
    //The input status code from each bootcamps.js CRUD operation will be set as that statusCode.
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
