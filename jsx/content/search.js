define([
    'react',
    'classnames',
    'config',
    'load!actions/actions',
    'load!stores/searchStore',
    'load!stores/vehicleStore',
    'load!components/elements/select'
], function(
    React,
    cn,
    config,
    Act,
    searchStore,
    vehicleStore,
    SelectField
) {

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
            // vehicleStore.bind('change', this._updateStatus);
        },
        componentWillUnmount: function() {
            searchStore.unbind('change', this._updateStatus);    
            // vehicleStore.unbind('change', this._updateStatus);    
        },
        shouldComponentUpdate: function(nextProps, nextState) {
            return true;
            // var isTabChanged = (nextState.activeTab !== this.state.activeTab);
            // var isFieldsInited = (this.state.fieldOptions.width.length == 0 && nextState.fieldOptions.width.length > 0);
            // var should = isTabChanged || isFieldsInited;
            // if (!should) {
            //     var vehicleFields = ['year', 'make', 'model', 'trim'];
            //     for (var i = 0; i < 4; i++) {
            //         var fieldName = vehicleFields[i];
            //         if (this.state.fieldValues.vehicle && nextState.fieldValues.vehicle[fieldName] !== this.state.fieldValues.vehicle[fieldName]) {
            //             should = true;
            //             break;
            //         }
            //     }
            // }
            // return should;
        },


        render: function() {
            return (
                <div className={cn('search_wrapper')} id={cn('search_wrapper')}>
                    <div className={cn('search_inner')}>
                        <p className={cn('search_intro')}>Find your tires using the form below. You can search by vehicle or tire size. You can also narrow down your search by tire category and brand.</p>
                        <form id={cn('search_by')} className={cn('search_by')} role="search" onSubmit={this._handleSubmit}>
                            <a href="#locations" onClick={this._handleLocationsClick} className={cn(['change_location', 'modal_open'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE0C8;' }} />Change Location</a>
                            <div className={cn('tabs')}>
                                <ul role="tablist">
                                    {this._tabs()}                                    
                                </ul>
                                {this._tabsContent()}  
                            </div>
                        </form>
                    </div>          
                </div>                
            );
        },

        _tabs: function() {
            var tabs = [
                <li key={1} className={cn('tab')} role="presentation">
                    <a href="#vehicle_tab" onClick={this._handleTabClick.bind(this, 'vehicle')} className={cn(['tab_link', 'font_color'])} role="tab" aria-selected={this.state.activeTab == 'vehicle'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE531;' }} /> Search by vehicle</a>
                </li>,
                <li key={2} className={cn('tab')} role="presentation">
                    <a href="#size_tab" onClick={this._handleTabClick.bind(this, 'size')} className={cn('font_color')} role="tab" aria-selected={this.state.activeTab == 'size'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE019;' }} /> Search by tire size</a>
                </li>
            ];
            if (config.sa) {
                tabs.push((
                    <li key={3} className={cn('tab')} role="presentation">
                        <a href="#size_tab" onClick={this._handleTabClick.bind(this, 'part_number')} className={cn('font_color')} role="tab" aria-selected={this.state.activeTab == 'part_number'}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8F3;' }} /> Search by part number</a>
                    </li>
                ));
            }
            return tabs;
        },

        _tabsContent: function() {
            var contents = [
                <div key={1} className={cn(['tab_cont', 'search_fields', 'by_vehicle_tab'])} id={cn('by_vehicle_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'vehicle'}>
                    <fieldset className={cn('fields_wrapper')}>
                        <SelectField 
                                    options={this.state.fieldOptions.year}                                                                     
                                    value={this.state.fieldValues.vehicle.year} onChange={this._handleVehicleChange} 
                                    name="vehicle_year" label="Choose Year"
                                    className={cn(['sixcol', 'field'])} require={true} />
                        <SelectField 
                                    options={this.state.fieldOptions.make}          
                                    value={this.state.fieldValues.vehicle.make} onChange={this._handleVehicleChange}
                                    name="vehicle_make" label="Choose Make" require={true}
                                    className={cn(['sixcol', 'last', 'field'])} disabled={this.state.fieldOptions.make.length <= 0} />
                        <SelectField 
                                    options={this.state.fieldOptions.model}         
                                    value={this.state.fieldValues.vehicle.model} onChange={this._handleVehicleChange}
                                    name="vehicle_model" label="Choose Model"
                                    className={cn(['sixcol', 'field'])} disabled={this.state.fieldOptions.model.length <= 0} require="1" />
                        <SelectField 
                                    options={this.state.fieldOptions.trim}          
                                    value={this.state.fieldValues.vehicle.trim} onChange={this._handleVehicleChange}
                                    name="vehicle_trim" label="Choose Trim"
                                    className={cn(['sixcol', 'last', 'field'])} disabled={this.state.fieldOptions.trim.length <= 0} require="1" />
                        <SelectField 
                                    options={this.state.fieldOptions.base_category}                                                            
                                    value={this.state.fieldValues.vehicle.base_category} onChange={this._handleFieldChange} 
                                    name="vehicle_base_category" label="Tire Type"
                                    className={cn(['sixcol', 'field'])} emptyDesc="All Tires" />
                        <SelectField 
                                    options={this.state.fieldOptions.car_tire_id}   
                                    value={this.state.fieldValues.vehicle.car_tire_id} onChange={this._handleFieldChange}
                                    name="vehicle_car_tire_id" label="Tire Size"    
                                    className={cn(['sixcol', 'last', 'field'])} disabled={this.state.fieldOptions.car_tire_id.length <= 0} require="1" emptyDesc={false}/>
                        
                        <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                    </fieldset>
                </div>,
                <div key={2} className={cn(['tab_cont', 'search_fields', 'by_tire_size_tab'])} id={cn('by_tire_size_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'size'}>
                    <fieldset className={cn('fields_wrapper')}>
                        <SelectField 
                                    options={this.state.fieldOptions.width}         
                                    value={this.state.fieldValues.size.width} onChange={this._handleFieldChange}          
                                    name="size_width" label="Choose Width"  
                                    className={cn(['sixcol', 'field'])} require="1" />
                        <SelectField 
                                    options={this.state.fieldOptions.height}        
                                    value={this.state.fieldValues.size.height} onChange={this._handleFieldChange}  
                                    name="size_height" label="Choose Height" require="1" 
                                    className={cn(['sixcol', 'last', 'field'])} />
                        <SelectField 
                                    options={this.state.fieldOptions.rim}           
                                    value={this.state.fieldValues.size.rim} onChange={this._handleFieldChange} 
                                    name="size_rim" label="Choose Rim"    
                                    className={cn(['sixcol', 'field'])} require="1" />
                        <SelectField 
                                    options={this.state.fieldOptions.base_category} 
                                    value={this.state.fieldValues.size.base_category} onChange={this._handleFieldChange} 
                                    name="size_base_category" label="Tire Type"
                                    className={cn(['sixcol', 'last', 'field'])} emptyDesc="All Tires" />
                        <SelectField 
                                    options={this.state.fieldOptions.speed_rating} 
                                    value={this.state.fieldValues.size.speed_rating} onChange={this._handleFieldChange} 
                                    name="size_speed_rating" label="Speed Rating" 
                                    className={cn(['sixcol', 'field'])}  />
                        <SelectField 
                                    options={this.state.fieldOptions.load_index} 
                                    value={this.state.fieldValues.size.load_index} onChange={this._handleFieldChange} 
                                    name="size_load_index" label="Load Index" 
                                    className={cn(['sixcol', 'last', 'field'])} />

                        <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                    </fieldset>
                </div>
            ];
            if (config.sa) {
                contents.push((
                    <div key={3} className={cn(['tab_cont', 'search_fields', 'by_part_number_tab'])} id={cn('by_part_number_tab')} role="tabpanel" tabIndex="0" aria-hidden={this.state.activeTab !== 'part_number'}>
                        <fieldset className={cn('fields_wrapper_')}>
                            <div className={cn(['sixcol', 'field'])}>
                                <label htmlFor={cn('part_number')}>
                                    <span>Enter part number </span><span className="req">*</span>
                                </label>
                                <input onChange={this._handleFieldChange} type="text" id={cn('part_number')} name="part_number" value={this.state.fieldValues.part_number.part_number} />
                            </div>

                            <button type="submit" disabled={!this._isReadyForSearch()} className={cn(['btn', 'brand_btn'])}><i className={cn('material_icons')} dangerouslySetInnerHTML={{ __html: '&#xE8B6;' }} /> Find Your Tires</button>
                        </fieldset>
                    </div>
                ));
            }

            return contents;
        },

        _isReadyForSearch: function() {
            var sectionValues = this.state.fieldValues[this.state.activeTab];
            var isReady = false;
            switch (this.state.activeTab) {
                case 'size':
                    isReady = (sectionValues.width && sectionValues.height && sectionValues.rim);
                    break;
                case 'vehicle':
                    isReady = (sectionValues.car_tire_id != false);
                    break;
                case 'part_number':
                    isReady = (sectionValues.part_number != false);
                    break;
            }

            return isReady;
        },
        _updateStatus: function() {
            var fieldValues = searchStore.getAllValues();
            var options = searchStore.getAllOptions();
            this.setState({
                'activeTab': searchStore.getActiveSection(),
                'fieldOptions': options,
                'fieldValues': fieldValues
            });
        },
        _handleTabClick: function(tab, event) {
            event.preventDefault();
            Act.Search.changeTab(tab);
        },
        _handleSubmit: function(event) {
            event.preventDefault();
            Act.Tire.search();
        },
        _handleFieldChange: function(event) {
            var fieldName = event.target.name.replace( (this.state.activeTab + '_'), '');
            Act.Search.updateField(this.state.activeTab, fieldName, event.target.value);
        },
        _handleVehicleChange: function(event) {
            var fields = ['year', 'make', 'model', 'trim'];
            var fieldName = event.target.name.replace( (this.state.activeTab + '_'), '');
            var index = fields.indexOf(fieldName);

            // var value = event.traget.value;
            var values = this.state.fieldValues.vehicle;
            values[fieldName] = event.target.value;
            
            var values = {
                year: values.year,
                make: index < 1 ? '' : values.make,
                model: index < 2 ? '' : values.model,
                trim: index < 3 ? '' : values.trim
            };

            Act.Vehicle.change(values, 'search');
        },
        _handleLocationsClick: function(event) {
            event.preventDefault();
            Act.Popup.show('locations');
        }
    }

});