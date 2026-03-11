export function toast(message, type='info'){window.dispatchEvent(new CustomEvent('krema:toast',{detail:{message,type}}));}
