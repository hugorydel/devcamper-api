class ErrorResponse extends Error {
  constructor(message, statusCode) {
    //super calls the message from the Error class (the purpose of the super() is to have the ability to call methods of extended classes into our (in this instance ErrorResponse) class)
    super(message);
    this.statusCode = statusCode;
  }
}
