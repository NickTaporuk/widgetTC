define([
    'react',
    'classnames',
    'load!actions/actions',
    'load!stores/searchStore'
], function(
    React,
    cn,
    Act,
    searchStore
) {

    var SelectField = React.createClass({
        getDefaultProps: function() {
            return {
                require: false,
                emptyDesc: '- Select -'
            }
        },
        render: function() {
            var options = [<option key="-1" value="">{ this.props.emptyDesc }</option>];
            this.props.options.map(function(option, i) {
                options.push(<option key={i} value={option.value}>{option.description}</option>);
            }.bind(this));

            var name = this.props.name;

            var req = null;
            if (this.props.require) {
                req = <span className="req">*</span>;
            }

            return (
                <div className={this.props.className}>
                    <label htmlFor={cn(name)}>{this.props.label + ' '}{req}</label>
                    <select id={cn(name)} name={name}>
                        {options}
                    </select>
                </div>
            );
        }
    });

    return {
        getInitialState: function() {
            return  {
                activeTab: 'size',
                fieldOptions: {},
                fieldValues: {}
            }
        },

        componentWillMount: function() {
            this._updateStatus();
        },
        componentDidMount: function() {
            searchStore.bind('change', this._updateStatus);
        },
        componentWillUnmount: function() {
            searchStore.unbind('change', this._updateStatus);    
        },
        shouldComponentUpdate: function(nextProps, nextState) {
            var vehicleFields = ['year', 'make', 'model', 'trim'];
            var isTabChanged = (nextState.activeTab !== this.state.activeTab);
            var isFieldsInited = (this.state.fieldOptions.width.length == 0 && nextState.fieldOptions.width.length > 0);
            var should = isTabChanged || isFieldsInited;
            if (!should) {
                for (var i = 0; i < 4; i++) {
                    var fieldName = vehicleFields[i];
                    if (this.state.fieldValues.vehicle && nextState.fieldValues.vehicle[fieldName] !== this.state.fieldValues.vehicle[fieldName]) {
                        should = true;
                    }
                }
            }

            return should;
        },


        render: function() {
            // console.log(this.state.fieldOptions);
            return (
                <div className={cn('search_wrapper')} id={cn('search_wrapper')}>
                    <div className={cn('search_inner')}>
                        <p className={cn('search_intro')}>Find your tires using the form below. You can search by vehicle or tire size. You can also narrow down your search by tire category and brand.</p>
                        <form action="results.php" id={cn('search_by')} className={cn('search_by')} role="search">
                            <a href="#locations" className={cn(['change_location', 'modal_open'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0C8;' }} />Change Location</a>
                            <div className={cn('tabs')}>
                                <ul role="tablist">
                                    <li className={cn('tab')} role="presentation">
                                        <a href="#vehicle_tab" onClick={this._handleTabClick.bind(this, 'vehicle')} className={cn(['tab_link', 'font_color'])} role="tab" aria-selected={this.state.activeTab == 'vehicle'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE531;' }} /> Search by vehicle</a>
                                    </li>
                                    <li className={cn('tab')} role="presentation">
                                        <a href="#size_tab" onClick={this._handleTabClick.bind(this, 'size')} className={cn('font_color')} role="tab" aria-selected={this.state.activeTab == 'size'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE019;' }} /> Search by tire size</a>
                                    </li>
                                </ul>
                                <div className={cn(['tab_cont', 'search_fields', 'by_vehicle_tab'])} id={cn('by_vehicle_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'vehicle'}>
                                    <fieldset className={cn('fields_wrapper')}>
                                        <SelectField options={this.state.fieldOptions.year}          className={cn(['sixcol', 'field'])}         name="vehicle_year"          label="Choose Year"  require="1" />
                                        <SelectField options={this.state.fieldOptions.make}          className={cn(['sixcol', 'last', 'field'])} name="vehicle_make"          label="Choose Make"  require="1" />
                                        <SelectField options={this.state.fieldOptions.model}         className={cn(['sixcol', 'field'])}         name="vehicle_model"         label="Choose Model" require="1" />
                                        <SelectField options={this.state.fieldOptions.trim}          className={cn(['sixcol', 'last', 'field'])} name="vehicle_make"          label="Choose Trim"  require="1" />
                                        <SelectField options={this.state.fieldOptions.base_category} className={cn(['sixcol', 'field'])}         name="vehicle_base_category" label="Tire Type"    emptyDesc="All Tires" />
                                        <SelectField options={this.state.fieldOptions.car_tire_id}   className={cn(['sixcol', 'last', 'field'])} name="vehicle_car_tire_id"   label="Tire Size"    require="1" />
                                        
                                        <button type="submit" className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                                    </fieldset>
                                </div>
                                <div className={cn(['tab_cont', 'search_fields', 'by_tire_size_tab'])} id={cn('by_tire_size_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'size'}>
                                    <fieldset className={cn('fields_wrapper')}>
                                        <SelectField options={this.state.fieldOptions.width}         className={cn(['sixcol', 'field'])}         name="size_width"         label="Choose Width"  require="1" />
                                        <SelectField options={this.state.fieldOptions.height}        className={cn(['sixcol', 'last', 'field'])} name="size_height"        label="Choose Height" require="1" />
                                        <SelectField options={this.state.fieldOptions.rim}           className={cn(['sixcol', 'field'])}         name="size_rim"           label="Choose Rim"    require="1" />
                                        <SelectField options={this.state.fieldOptions.base_category} className={cn(['sixcol', 'last', 'field'])} name="size_base_category" label="Tire Type"     emptyDesc="All Tires" />
                                        <SelectField options={this.state.fieldOptions.speed_rating}  className={cn(['sixcol', 'field'])}         name="size_speed_rating"  label="Speed Rating"  />
                                        <SelectField options={this.state.fieldOptions.load_index}    className={cn(['sixcol', 'last', 'field'])} name="size_load_index"    label="Load Index"    />

                                        <button type="submit" className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                                    </fieldset>
                                </div>
                            </div>
                        </form>
                    </div>          
                </div>                
            );
        },

        _updateStatus: function() {
            this.setState({
                'activeTab': searchStore.getActiveSection(),
                'fieldOptions': searchStore.getAllOptions(),
                'fieldValues': searchStore.getAllValues()
            });
        },
        _handleTabClick: function(tab, event) {
            event.preventDefault();

            // Act.Search.updateParam('tab', tab);

            this.setState({'activeTab': tab});
        }
    }

});