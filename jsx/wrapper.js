define([
    'react',
    'classnames', 
    'load!actions/actions',
    'load!components/header', 
    'load!components/content'
], function(
    React,
    cn, 
    Act,
    Header, 
    Content
) {

    return {
        render: function() {
            return (
                <div id={cn('widget')}>
                    <Header />
                    <Content />
                </div>
            );
        }
    };

});