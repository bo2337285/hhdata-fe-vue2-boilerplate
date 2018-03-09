export default {
  //必填校验
  required (rule, value, callback){
    if (!value && value !== 0) {
        return callback(new Error('该项不能为空'));
    } else {
      callback();
    }
  },
  number (rule, value, callback){

  }
}
