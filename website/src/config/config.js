import configDev from './config.dev'
import configProd from './config.prod'
import configSandbox from './config.sandbox'
import configLib from './config.lib'

const isLocalhost = context => Boolean(
  context.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  context.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  context.location.hostname.match(
  /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

const isSandbox = context => Boolean(
  context.location.hostname.match(
    /sandbox\.arrivy\.com$/
  ) ||
  context.location.hostname.match(
    /arrivy-sandbox\.appspot\.com$/
  )
);

const config = context => {
  if(isLocalhost(context) && process.env.NODE_ENV !== 'production'){
    return configDev;
  } else if(IS_LIB){
    return configLib;
  } else if(isSandbox(context)){
    return configSandbox;
  } else {
    return configProd;
  };
};

export default context => config(context);