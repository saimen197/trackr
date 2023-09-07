let config = {
    redirectToLogin: () => { console.warn("redirectToLogin has not been set."); }
};

export const setRedirectToLogin = (fn) => {
    config.redirectToLogin = fn;
    console.log('config redirect');
};

export default config;

 