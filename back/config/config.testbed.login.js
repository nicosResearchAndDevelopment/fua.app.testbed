exports.page = {
    title: 'NRD-Testbed Login',
    // info: 'This is the login page for the NRD-Testbed.',
    lang: 'en'
};

exports.login = {
    method: 'POST',
    target: '/login',
    button: 'Submit',
    user:   {
        name:        'user',
        type:        'email',
        label:       'Username',
        maxlength:   64,
        placeholder: 'max@mustermann.de'
    },
    pass:   {
        name:        'password',
        label:       'Password',
        maxlength:   64,
        placeholder: 'secure password'
    }
    // tfa:   {
    //     name:        'tfa',
    //     type:        'text',
    //     label:       'Two-Factor-Authentication',
    //     maxlength:   64,
    //     button:      'Acquire Second Factor',
    //     method:      'POST',
    //     target:      '/login/tfa',
    //     placeholder: '1234-5678',
    //     pattern:     '^\\d{4}-?\\d{4}$'
    // }
};

// exports.report = {
//     method:      'POST',
//     target:      '/login/report',
//     browser:     true,
//     geolocation: true
// };
