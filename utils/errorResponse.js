// extends the core error class and includes a status code so that we can customize that when we call next we'll be able to instantiate the error response class with a custom message and status code. In summary we'll be making a custom object based on the ErrrorResponse class which will have 2 properties message and a statusCode of our choice.
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    //super - calls the message from the Error class (the purpose of the super() is to have the ability to call methods of extends classes into our own (in this instance ErrorResponse) class)
    //The following super is basically err.message as it goes to the Error (a filled in Error class when applied in the real world) and takes its message
    super(message);
    //The input status code from each bootcamps.js CRUD operation will be set as that statusCode, the statusCode is a real built in status code and we're just overwriting it for this single operation
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
