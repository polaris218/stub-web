import ipRegex from 'ip-regex';
import tlds from 'tlds';

export const getServerOrigin = () =>
    document.location.origin;

export const isValidUrl = (url) => {
  url = Object.assign({ strict: true }, url);

  const protocol = `(?:(?:[a-z]+:)?//)${url.strict ? '' : '?'}`;
  const auth = '(?:\\S+(?::\\S*)?@)?';
  const ip = ipRegex.v4().source;
  const host = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)';
  const domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
  const tld = `(?:\\.${url.strict ? '(?:[a-z\\u00a1-\\uffff]{2,})' : `(?:${tlds.sort((a, b) => b.length - a.length).join('|')})`})\\.?`;
  const port = '(?::\\d{2,5})?';
  const path = '(?:[/?#][^\\s"]*)?';
  const regex = `(?:${protocol}|www\\.)${auth}(?:localhost|${ip}|${host}${domain}${tld})${port}${path}`;

  return url.exact ? new RegExp(`(?:^${regex}$)`, 'i') : new RegExp(regex, 'ig');
};
