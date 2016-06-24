define([
    'react',
    'config',
    'classnames',
    'load!actions/act',
    'lib/helper',
    'load!stores/compareTiresStore',
    'load!components/page/common/back',
    'actions/api',
    'promise',
    'lockr',
    'load!stores/appStore'
], function(
    React,
    config,
    cn,
    A,
    h,
    compareTiresStore,
    Back,
    Api,
    Promise,
    lockr,
    appStore
) {
    var results, compareTires;

    return {
        displayName: 'comparingTires',

        statics: {
            prepare: function (props) {

                var searchParams        = _.cloneDeep(props);

                console.log(appStore.getPageState(this));
                var locationId  = lockr.get('location_id');
                var compareTiresDecoded = compareTires.map(function(tireId) {
                    return h.base64Decode(tireId).split('||')[1];
                });

                searchParams.location_id    = locationId;
                return Promise.all([
                    Api.searchTires(searchParams)
                ]).then(function (responses) {
                    results = responses;
                });
            }
        },
        getInitialState: function() {
            return {
                ready: false,
                comparingTires: []
            };
        },

        render: function() {
            return (
                <div>
                    <Back />

                    <div className="tcwlw_compare_wrapper">
                        <div className="tcwlw_compare_title">
                            <h3 className="tcwlw_compare_title_text">Compare Tires</h3>
                            <label className="tcwlw_qty tcwlw_compare_qty">
                                <span className="tcwlw_qty_label">Qty:</span>
                                <select name="tcwlw_qty_result_1">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4" selected="selected">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                </select>
                            </label>
                        </div>

                        <div className="tcwlw_twelvecol">
                            <div className="tcwlw_border_color tcwlw_compare_list_wrapper">
                                <ol className="tcwlw_compare_list">
                                    <li className="tcwlw_compare_item">
                                        <div className="tcwlw_compare_header">
                                            <h3 className="tcwlw_compare_item_title">Azenis PT722 A/S</h3>
                                        </div>
                                        <div className="tcwlw_compare_body">
                                            <img src="../img/tires/example-tire.jpg" alt="An image of the tire" className="tcwlw_result_tire"/>
                                                <ul className="tcwlw_result_specs_list">
                                                    <li>Size: <strong className="tcwlw_result_spec_value">245/55R18</strong></li>
                                                    <li>Category: <strong className="tcwlw_result_spec_value">Touring All Season</strong></li>
                                                    <li>Speed Rating: <strong className="tcwlw_result_spec_value">W</strong></li>
                                                    <li>Load Index: <strong className="tcwlw_result_spec_value">103</strong></li>
                                                    <li>Sidewall: <strong className="tcwlw_result_spec_value">BW</strong></li>
                                                    <li>Warranty: <strong className="tcwlw_result_spec_value">65000</strong></li>
                                                    <li>Part: <strong className="tcwlw_result_spec_value">146600</strong></li>
                                                </ul>
                                        </div>
                                        <div className="tcwlw_result_select_actions">
                                            <div className="tcwlw_result_price">
                                                <h5 className="tcwlw_price">Price: <strong className="tcwlw_price_value">$765.40</strong></h5>
                                            </div>
                                            <a href="/summary.php" className="tcwlw_btn tcwlw_brand_btn tcwlw_select_btn">Select Tire <i className="tcwlw_material_icons"></i></a>
                                        </div>
                                    </li>
                                    <li className="tcwlw_compare_item">
                                        <div className="tcwlw_compare_header">
                                            <h3 className="tcwlw_compare_item_title">ZIEX ZE950 A/S</h3>
                                        </div>
                                        <div className="tcwlw_compare_body">
                                            <img src="../img/tires/example-tire.jpg" alt="An image of the tire" className="tcwlw_result_tire"/>
                                                <ul className="tcwlw_result_specs_list">
                                                    <li>Size: <strong className="tcwlw_result_spec_value">245/55R18</strong></li>
                                                    <li>Category: <strong className="tcwlw_result_spec_value">Touring All Season</strong></li>
                                                    <li>Speed Rating: <strong className="tcwlw_result_spec_value">W</strong></li>
                                                    <li>Load Index: <strong className="tcwlw_result_spec_value">103</strong></li>
                                                    <li>Sidewall: <strong className="tcwlw_result_spec_value">BW</strong></li>
                                                    <li>Warranty: <strong className="tcwlw_result_spec_value">65000</strong></li>
                                                    <li>Part: <strong className="tcwlw_result_spec_value">146600</strong></li>
                                                </ul>
                                        </div>
                                        <div className="tcwlw_result_select_actions">
                                            <div className="tcwlw_result_price">
                                                <h5 className="tcwlw_price">Price: <strong className="tcwlw_price_value">$765.40</strong></h5>
                                            </div>
                                            <a href="/summary.php" className="tcwlw_btn tcwlw_brand_btn tcwlw_select_btn">Select Tire <i className="tcwlw_material_icons"></i></a>
                                        </div>
                                    </li>
                                    <li className="tcwlw_compare_item">
                                        <div className="tcwlw_compare_header">
                                            <h3 className="tcwlw_compare_item_title">Firehawk Wide Oval AS</h3>
                                        </div>
                                        <div className="tcwlw_compare_body">
                                            <img src="../img/tires/example-tire.jpg" alt="An image of the tire" className="tcwlw_result_tire"/>
                                                <ul className="tcwlw_result_specs_list">
                                                    <li>Size: <strong className="tcwlw_result_spec_value">245/55R18</strong></li>
                                                    <li>Category: <strong className="tcwlw_result_spec_value">Touring All Season</strong></li>
                                                    <li>Speed Rating: <strong className="tcwlw_result_spec_value">W</strong></li>
                                                    <li>Load Index: <strong className="tcwlw_result_spec_value">103</strong></li>
                                                    <li>Sidewall: <strong className="tcwlw_result_spec_value">BW</strong></li>
                                                    <li>Warranty: <strong className="tcwlw_result_spec_value">65000</strong></li>
                                                    <li>Part: <strong className="tcwlw_result_spec_value">146600</strong></li>
                                                </ul>
                                        </div>
                                        <div className="tcwlw_result_select_actions">
                                            <div className="tcwlw_result_price">
                                                <h5 className="tcwlw_price">Price: <strong className="tcwlw_price_value">$765.40</strong></h5>
                                            </div>
                                            <a href="/summary.php" className="tcwlw_btn tcwlw_brand_btn tcwlw_select_btn">Select Tire <i className="tcwlw_material_icons"></i></a>
                                        </div>
                                    </li>
                                </ol>
                            </div>
                        </div>
                        {/*<div className="tcwlw_twelvecol tcwlw_bottom_btns">
                            <a href="#" className="tcwlw_brand_btn_light tcwlw_btn_small tcwlw_left"><i className="tcwlw_material_icons"></i> Email Yourself This Comparison</a>
                            <button className="tcwlw_brand_btn_light tcwlw_btn_small tcwlw_right"><i className="tcwlw_material_icons"></i> Print this page</button>
                        </div>*/}
                    </div>
                </div>
            );
        },

    }
});