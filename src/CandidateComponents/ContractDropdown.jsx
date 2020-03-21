import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { fbContractsDB } from "../firebase.config";

// returns an array of contract names:
// [hawkeye, meritage, R2]

export default class ContractDropdown extends Component {
    constructor(props) {
        super(props);

        this.state = { contracts: [] };
    }

    componentDidMount() {
        this.listener = fbContractsDB.on("value", data => {
            let contracts = [];
            data.forEach(function(contract) {
                contracts.push({ key: contract.key, info: contract.val() });
            });
            this.setState({
                contracts
            });
        });
    }

    componentWillUnmount() {
        fbContractsDB.off("value", this.listener);
    }

    onChange = (ev, selection) => {
        this.props.onChange(selection.value);
    };

    render() {
        const { contracts } = this.state;
        const { onChange, contractsoverride = [], ...rest } = this.props;
        const contractList = contracts
            .filter(OverrideContracts(contractsoverride))
            .map(({ key, info: contract }) => {
                return { key: key, text: contract.name, value: contract.name };
            })
            .sort((a, b) => {
                var comparison = 0;
                if (a.text > b.text) {
                    comparison = 1;
                } else if (a.text < b.text) {
                    comparison = -1;
                }
                return comparison;
            });
        return <Dropdown {...rest} selectOnBlur={false} options={contractList} onChange={this.onChange} />;
    }
}

function OverrideContracts(contractsoverride) {
    return function(contract) {
        if (contractsoverride.length > 0) {
            return contractsoverride.includes(contract.info.name);
        } else {
            return contract;
        }
    };
}
