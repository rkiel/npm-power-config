const _ = require('lodash');

const pathTo = x => require(`../../${x}`);
const lib = pathTo('lib/input');

describe('input', () => {
  let state;
  beforeEach(() => (state = {}));

  describe('when there is no program input', () => {
    beforeEach(() => _.set(state, 'program.input', undefined));

    describe('when there is no output fileName', () => {
      beforeEach(() => _.set(state, 'output.fileName', undefined));

      it('should work', () => {
        expect(lib.addFileName(state)).toEqual({
          program: { input: undefined },
          output: { fileName: undefined },
          input: { fileName: 'environment.inputs.json' }
        });
      });
    });

    describe('when there is an output fileName with no slash', () => {
      beforeEach(() => _.set(state, 'output.fileName', 'myEnv.example.json'));

      it('should work', () => {
        expect(lib.addFileName(state)).toEqual({
          program: { input: undefined },
          output: { fileName: 'myEnv.example.json' },
          input: { fileName: 'myEnv.inputs.json' }
        });
      });
    });

    describe('when there is an output fileName with a slash', () => {
      beforeEach(() => _.set(state, 'output.fileName', 'one/two/myEnv.example.json'));

      it('should work', () => {
        expect(lib.addFileName(state)).toEqual({
          program: { input: undefined },
          output: { fileName: 'one/two/myEnv.example.json' },
          input: { fileName: 'one/two/myEnv.inputs.json' }
        });
      });
    });
  });

  describe('when there is a program input', () => {
    beforeEach(() => _.set(state, 'program.input', 'myEnv.inputs.json'));

    describe('when there is no output fileName', () => {
      beforeEach(() => _.set(state, 'output.fileName', undefined));

      it('should work', () => {
        expect(lib.addFileName(state)).toEqual({
          program: { input: 'myEnv.inputs.json' },
          output: { fileName: undefined },
          input: { fileName: 'myEnv.inputs.json' }
        });
      });
    });

    describe('when there is an output fileName with no slash', () => {
      beforeEach(() => _.set(state, 'output.fileName', 'myEnv.example.json'));

      it('should work', () => {
        expect(lib.addFileName(state)).toEqual({
          program: { input: 'myEnv.inputs.json' },
          output: { fileName: 'myEnv.example.json' },
          input: { fileName: 'myEnv.inputs.json' }
        });
      });
    });

    describe('when there is an output fileName with a slash', () => {
      beforeEach(() => _.set(state, 'output.fileName', 'one/two/myEnv.example.json'));

      it('should work', () => {
        expect(lib.addFileName(state)).toEqual({
          program: { input: 'myEnv.inputs.json' },
          output: { fileName: 'one/two/myEnv.example.json' },
          input: { fileName: 'myEnv.inputs.json' }
        });
      });
    });
  });
}); // input
