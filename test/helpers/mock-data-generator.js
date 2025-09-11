/**
 * Mock Data Generator for testing validation rules
 * Provides factory methods to generate test documents with various scenarios
 */

class MockDataGenerator {
    /**
     * Generate a valid person document that should pass all validation rules
     */
    static generateValidPerson(overrides = {}) {
        const defaults = {
            name: "Valid Test Person",
            income: 20000,
            householdSize: 4,
            numberOfDependents: 2,
            interviewComplete: "true"
        };
        
        return { ...defaults, ...overrides };
    }

    /**
     * Generate an invalid person document that should fail validation
     */
    static generateInvalidPerson(overrides = {}) {
        const defaults = {
            name: "Invalid Test Person",
            income: 35000, // Too high
            householdSize: 2, // Too small
            numberOfDependents: 0, // Too few
            interviewComplete: "" // Empty
        };
        
        return { ...defaults, ...overrides };
    }

    /**
     * Generate a person with high income (should fail income validation)
     */
    static generateHighIncomePerson(income = 30000) {
        return this.generateValidPerson({ 
            name: "High Income Person",
            income: income 
        });
    }

    /**
     * Generate a person with small household (should fail household size validation)
     */
    static generateSmallHouseholdPerson(householdSize = 1) {
        return this.generateValidPerson({ 
            name: "Small Household Person",
            householdSize: householdSize 
        });
    }

    /**
     * Generate a person with too few dependents (should fail dependents validation)
     */
    static generateFewDependentsPerson(numberOfDependents = 0) {
        return this.generateValidPerson({ 
            name: "Few Dependents Person",
            numberOfDependents: numberOfDependents 
        });
    }

    /**
     * Generate a person with incomplete interview (should fail interview validation)
     */
    static generateIncompleteInterviewPerson() {
        return this.generateValidPerson({ 
            name: "Incomplete Interview Person",
            interviewComplete: "" 
        });
    }

    /**
     * Generate edge case documents for boundary testing
     */
    static generateEdgeCases() {
        return {
            // Income edge cases
            incomeAtThreshold: this.generateValidPerson({ income: 25000 }),
            incomeJustOverThreshold: this.generateValidPerson({ income: 25001 }),
            incomeJustUnderThreshold: this.generateValidPerson({ income: 24999 }),
            zeroIncome: this.generateValidPerson({ income: 0 }),

            // Household size edge cases
            householdSizeAtThreshold: this.generateValidPerson({ householdSize: 3 }),
            householdSizeJustUnderThreshold: this.generateValidPerson({ householdSize: 2 }),
            householdSizeOne: this.generateValidPerson({ householdSize: 1 }),
            largeHousehold: this.generateValidPerson({ householdSize: 10 }),

            // Dependents edge cases
            dependentsAtThreshold: this.generateValidPerson({ numberOfDependents: 2 }),
            dependentsJustUnderThreshold: this.generateValidPerson({ numberOfDependents: 1 }),
            zeroDependents: this.generateValidPerson({ numberOfDependents: 0 }),
            manyDependents: this.generateValidPerson({ numberOfDependents: 8 }),

            // Interview edge cases
            interviewTrue: this.generateValidPerson({ interviewComplete: "true" }),
            interviewFalse: this.generateValidPerson({ interviewComplete: "false" }),
            interviewYes: this.generateValidPerson({ interviewComplete: "yes" }),
            interviewCompleted: this.generateValidPerson({ interviewComplete: "completed" }),
            interviewEmpty: this.generateValidPerson({ interviewComplete: "" }),
            interviewUndefined: (() => {
                const doc = this.generateValidPerson();
                delete doc.interviewComplete;
                return doc;
            })()
        };
    }

    /**
     * Generate a batch of test documents for bulk testing
     */
    static generateBatch(count = 10) {
        const batch = [];
        
        for (let i = 0; i < count; i++) {
            const isValid = i % 2 === 0; // Alternate between valid and invalid
            
            if (isValid) {
                batch.push(this.generateValidPerson({
                    name: `Valid Person ${i + 1}`,
                    income: 15000 + (i * 1000), // Vary income but keep valid
                    householdSize: 3 + (i % 3), // Vary household size 3-5
                    numberOfDependents: 2 + (i % 2) // Vary dependents 2-3
                }));
            } else {
                // Create different types of invalid documents
                const invalidType = i % 4;
                switch (invalidType) {
                    case 0:
                        batch.push(this.generateHighIncomePerson(30000 + (i * 1000)));
                        break;
                    case 1:
                        batch.push(this.generateSmallHouseholdPerson(1 + (i % 2)));
                        break;
                    case 2:
                        batch.push(this.generateFewDependentsPerson(i % 2));
                        break;
                    case 3:
                        batch.push(this.generateIncompleteInterviewPerson());
                        break;
                }
            }
        }
        
        return batch;
    }

    /**
     * Generate documents that test multiple validation failures
     */
    static generateMultipleFailures() {
        return [
            // Fails all validations
            {
                name: "Fails All",
                income: 50000,
                householdSize: 1,
                numberOfDependents: 0,
                interviewComplete: ""
            },
            // Fails income and household size
            {
                name: "Fails Income and Household",
                income: 35000,
                householdSize: 2,
                numberOfDependents: 3,
                interviewComplete: "true"
            },
            // Fails dependents and interview
            {
                name: "Fails Dependents and Interview",
                income: 20000,
                householdSize: 4,
                numberOfDependents: 1,
                interviewComplete: ""
            }
        ];
    }
}

module.exports = MockDataGenerator;
