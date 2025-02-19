import React from 'react';
import { Select, SelectOption } from '@patternfly/react-core';
import pluralize from 'pluralize';
import { FormikErrors } from 'formik';
import isEmpty from 'lodash/isEmpty';

import useSelectToggle from 'hooks/patternfly/useSelectToggle';
import {
    isByLabelSelector,
    isByNameSelector,
    ScopedResourceSelector,
    SelectorEntityType,
} from '../types';
import ByNameSelector from './ByNameSelector';
import ByLabelSelector from './ByLabelSelector';

const selectorOptions = ['All', 'ByName', 'ByLabel'] as const;

type RuleSelectorOption = typeof selectorOptions[number];

function isRuleSelectorOption(value: string): value is RuleSelectorOption {
    return selectorOptions.includes(value as RuleSelectorOption);
}

export type RuleSelectorProps = {
    entityType: SelectorEntityType;
    scopedResourceSelector: ScopedResourceSelector;
    handleChange: (
        entityType: SelectorEntityType,
        scopedResourceSelector: ScopedResourceSelector
    ) => void;
    validationErrors: FormikErrors<ScopedResourceSelector> | undefined;
};

function RuleSelector({
    entityType,
    scopedResourceSelector,
    handleChange,
    validationErrors,
}: RuleSelectorProps) {
    const { isOpen, onToggle, closeSelect } = useSelectToggle();
    const pluralEntity = pluralize(entityType);

    function onRuleOptionSelect(_, value) {
        if (!isRuleSelectorOption(value)) {
            return;
        }

        const selectorMap: Record<RuleSelectorOption, ScopedResourceSelector> = {
            All: {},
            ByName: {
                field: entityType,
                rule: { operator: 'OR', values: [''] },
            },
            ByLabel: {
                field: `${entityType} Label`,
                rules: [{ operator: 'OR', key: '', values: [''] }],
            },
        };

        handleChange(entityType, selectorMap[value]);
        closeSelect();
    }

    let selection: RuleSelectorOption = 'All';

    if (isEmpty(scopedResourceSelector)) {
        selection = 'All';
    } else if (isByNameSelector(scopedResourceSelector)) {
        selection = 'ByName';
    } else if (isByLabelSelector(scopedResourceSelector)) {
        selection = 'ByLabel';
    }

    return (
        <div
            className="pf-u-p-lg"
            style={{ border: '1px solid var(--pf-global--BorderColor--100' }}
        >
            <Select
                toggleAriaLabel={`Select ${pluralEntity.toLowerCase()} by name or label`}
                className={`${selection === 'All' ? '' : 'pf-u-mb-lg'}`}
                isOpen={isOpen}
                onToggle={onToggle}
                selections={selection}
                onSelect={onRuleOptionSelect}
            >
                <SelectOption value="All">All {pluralEntity.toLowerCase()}</SelectOption>
                <SelectOption value="ByName">{pluralEntity} with names matching</SelectOption>
                <SelectOption value="ByLabel">{pluralEntity} with labels matching</SelectOption>
            </Select>

            {isByNameSelector(scopedResourceSelector) && (
                <ByNameSelector
                    entityType={entityType}
                    scopedResourceSelector={scopedResourceSelector}
                    handleChange={handleChange}
                    validationErrors={validationErrors}
                />
            )}

            {isByLabelSelector(scopedResourceSelector) && (
                <ByLabelSelector
                    entityType={entityType}
                    scopedResourceSelector={scopedResourceSelector}
                    handleChange={handleChange}
                    validationErrors={validationErrors}
                />
            )}
        </div>
    );
}

export default RuleSelector;
