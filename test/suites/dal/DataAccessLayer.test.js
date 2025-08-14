// file: test/suites/dal/DataAccessLayer.test.js (snippet to add)

// ... inside the 'DAL Integration Tests (Live Fetch)' describe block ...

runner.it('should fetch and parse a REAL multi-measure pattern file', async () => {
    // This test assumes `data/patterns/test_multi_measure.patt.yaml` exists.
    const result = await DataAccessLayer.getPattern('test_multi_measure');

    // This is the expected JavaScript object structure for our new format.
    const expectedData = {
        metadata: {
            name: "Test Multi Measure",
            metric: "2/4",
            resolution: 8
        },
        pattern_data: [
            { // Measure 1
                KCK: "||o-|-o||",
                HHC: "||x-x-||"
            },
            { // Measure 2
                KCK: "||o-|--||",
                HHC: "||x-x-||"
            }
        ]
    };

    runner.expect(result).toEqual(expectedData);
});