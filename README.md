# 🌸 @noelware/utils

> _Noelware's utilities package to not repeat code in our TypeScript projects._

**@noelware/utils** is a package full of extra utilities, that is Node.js and Browser-compatible.

## Usage

```typescript
import { Stopwatch, omitUndefinedOrNull } from '@noelware/utils';

const stopwatch = Stopwatch.newStarted();
// ... do something ...
stopwatch.end();

const omitted = omitUndefinedOrNull([undefined, null, 'a', 'b', 2, -2, true]);
// => ['a', 'b', 2, -2, true]
```

## License

**@noelware/utils** is released under the **MIT License** with love by Noelware.
