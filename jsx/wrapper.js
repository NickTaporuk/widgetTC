define([
    'react',
    'classnames', 
    'load!components/header', 
    'load!components/content'
], function(
    React,
    cn, 
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