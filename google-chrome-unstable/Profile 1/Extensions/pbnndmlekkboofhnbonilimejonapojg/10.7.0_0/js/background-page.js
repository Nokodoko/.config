/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 660:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect;
(function (Reflect) {
    // Metadata Proposal
    // https://rbuckton.github.io/reflect-metadata/
    (function (factory) {
        var root = typeof __webpack_require__.g === "object" ? __webpack_require__.g :
            typeof self === "object" ? self :
                typeof this === "object" ? this :
                    Function("return this;")();
        var exporter = makeExporter(Reflect);
        if (typeof root.Reflect === "undefined") {
            root.Reflect = Reflect;
        }
        else {
            exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter);
        function makeExporter(target, previous) {
            return function (key, value) {
                if (typeof target[key] !== "function") {
                    Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                }
                if (previous)
                    previous(key, value);
            };
        }
    })(function (exporter) {
        var hasOwn = Object.prototype.hasOwnProperty;
        // feature test for Symbol support
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
            create: supportsCreate
                ? function () { return MakeDictionary(Object.create(null)); }
                : supportsProto
                    ? function () { return MakeDictionary({ __proto__: null }); }
                    : function () { return MakeDictionary({}); },
            has: downLevel
                ? function (map, key) { return hasOwn.call(map, key); }
                : function (map, key) { return key in map; },
            get: downLevel
                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                : function (map, key) { return map[key]; },
        };
        // Load global or shim versions of Map, Set, and WeakMap
        var functionPrototype = Object.getPrototypeOf(Function);
        var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
        var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        // [[Metadata]] internal slot
        // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
        var Metadata = new _WeakMap();
        /**
         * Applies a set of decorators to a property of a target object.
         * @param decorators An array of decorators.
         * @param target The target object.
         * @param propertyKey (Optional) The property key to decorate.
         * @param attributes (Optional) The property descriptor for the target key.
         * @remarks Decorators are applied in reverse order.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Example = Reflect.decorate(decoratorsArray, Example);
         *
         *     // property (on constructor)
         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Object.defineProperty(Example, "staticMethod",
         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
         *
         *     // method (on prototype)
         *     Object.defineProperty(Example.prototype, "method",
         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
         *
         */
        function decorate(decorators, target, propertyKey, attributes) {
            if (!IsUndefined(propertyKey)) {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                    throw new TypeError();
                if (IsNull(attributes))
                    attributes = undefined;
                propertyKey = ToPropertyKey(propertyKey);
                return DecorateProperty(decorators, target, propertyKey, attributes);
            }
            else {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsConstructor(target))
                    throw new TypeError();
                return DecorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);
        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
        /**
         * A default metadata decorator factory that can be used on a class, class member, or parameter.
         * @param metadataKey The key for the metadata entry.
         * @param metadataValue The value for the metadata entry.
         * @returns A decorator function.
         * @remarks
         * If `metadataKey` is already defined for the target and target key, the
         * metadataValue for that key will be overwritten.
         * @example
         *
         *     // constructor
         *     @Reflect.metadata(key, value)
         *     class Example {
         *     }
         *
         *     // property (on constructor, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticProperty;
         *     }
         *
         *     // property (on prototype, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         property;
         *     }
         *
         *     // method (on constructor)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticMethod() { }
         *     }
         *
         *     // method (on prototype)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         method() { }
         *     }
         *
         */
        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                    throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);
        /**
         * Define a unique metadata entry on the target.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param metadataValue A value that contains attached metadata.
         * @param target The target object on which to define metadata.
         * @param propertyKey (Optional) The property key for the target.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Reflect.defineMetadata("custom:annotation", options, Example);
         *
         *     // property (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
         *
         *     // method (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
         *
         *     // decorator factory as metadata-producing annotation.
         *     function MyAnnotation(options): Decorator {
         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
         *     }
         *
         */
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        /**
         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        /**
         * Gets a value indicating whether the target object has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        /**
         * Gets the metadata keys defined on the target object or its prototype chain.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
         *
         */
        function getMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        /**
         * Gets the unique metadata keys defined on the target object.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
         *
         */
        function getOwnMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        /**
         * Deletes the metadata entry from the target object with the provided key.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.deleteMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function deleteMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            if (!metadataMap.delete(metadataKey))
                return false;
            if (metadataMap.size > 0)
                return true;
            var targetMetadata = Metadata.get(target);
            targetMetadata.delete(propertyKey);
            if (targetMetadata.size > 0)
                return true;
            Metadata.delete(target);
            return true;
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsConstructor(decorated))
                        throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target, propertyKey, descriptor);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsObject(decorated))
                        throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }
        function GetOrCreateMetadataMap(O, P, Create) {
            var targetMetadata = Metadata.get(O);
            if (IsUndefined(targetMetadata)) {
                if (!Create)
                    return undefined;
                targetMetadata = new _Map();
                Metadata.set(O, targetMetadata);
            }
            var metadataMap = targetMetadata.get(P);
            if (IsUndefined(metadataMap)) {
                if (!Create)
                    return undefined;
                metadataMap = new _Map();
                targetMetadata.set(P, metadataMap);
            }
            return metadataMap;
        }
        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
        function OrdinaryHasMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return true;
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryHasMetadata(MetadataKey, parent, P);
            return false;
        }
        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            return ToBoolean(metadataMap.has(MetadataKey));
        }
        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
        function OrdinaryGetMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryGetMetadata(MetadataKey, parent, P);
            return undefined;
        }
        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return undefined;
            return metadataMap.get(MetadataKey);
        }
        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
            metadataMap.set(MetadataKey, MetadataValue);
        }
        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
        function OrdinaryMetadataKeys(O, P) {
            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (parent === null)
                return ownKeys;
            var parentKeys = OrdinaryMetadataKeys(parent, P);
            if (parentKeys.length <= 0)
                return ownKeys;
            if (ownKeys.length <= 0)
                return parentKeys;
            var set = new _Set();
            var keys = [];
            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                var key = ownKeys_1[_i];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                var key = parentKeys_1[_a];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            return keys;
        }
        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
        function OrdinaryOwnMetadataKeys(O, P) {
            var keys = [];
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return keys;
            var keysObj = metadataMap.keys();
            var iterator = GetIterator(keysObj);
            var k = 0;
            while (true) {
                var next = IteratorStep(iterator);
                if (!next) {
                    keys.length = k;
                    return keys;
                }
                var nextValue = IteratorValue(next);
                try {
                    keys[k] = nextValue;
                }
                catch (e) {
                    try {
                        IteratorClose(iterator);
                    }
                    finally {
                        throw e;
                    }
                }
                k++;
            }
        }
        // 6 ECMAScript Data Typ0es and Values
        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
        function Type(x) {
            if (x === null)
                return 1 /* Null */;
            switch (typeof x) {
                case "undefined": return 0 /* Undefined */;
                case "boolean": return 2 /* Boolean */;
                case "string": return 3 /* String */;
                case "symbol": return 4 /* Symbol */;
                case "number": return 5 /* Number */;
                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                default: return 6 /* Object */;
            }
        }
        // 6.1.1 The Undefined Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
        function IsUndefined(x) {
            return x === undefined;
        }
        // 6.1.2 The Null Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
        function IsNull(x) {
            return x === null;
        }
        // 6.1.5 The Symbol Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
        function IsSymbol(x) {
            return typeof x === "symbol";
        }
        // 6.1.7 The Object Type
        // https://tc39.github.io/ecma262/#sec-object-type
        function IsObject(x) {
            return typeof x === "object" ? x !== null : typeof x === "function";
        }
        // 7.1 Type Conversion
        // https://tc39.github.io/ecma262/#sec-type-conversion
        // 7.1.1 ToPrimitive(input [, PreferredType])
        // https://tc39.github.io/ecma262/#sec-toprimitive
        function ToPrimitive(input, PreferredType) {
            switch (Type(input)) {
                case 0 /* Undefined */: return input;
                case 1 /* Null */: return input;
                case 2 /* Boolean */: return input;
                case 3 /* String */: return input;
                case 4 /* Symbol */: return input;
                case 5 /* Number */: return input;
            }
            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
            if (exoticToPrim !== undefined) {
                var result = exoticToPrim.call(input, hint);
                if (IsObject(result))
                    throw new TypeError();
                return result;
            }
            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
        function OrdinaryToPrimitive(O, hint) {
            if (hint === "string") {
                var toString_1 = O.toString;
                if (IsCallable(toString_1)) {
                    var result = toString_1.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            else {
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var toString_2 = O.toString;
                if (IsCallable(toString_2)) {
                    var result = toString_2.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            throw new TypeError();
        }
        // 7.1.2 ToBoolean(argument)
        // https://tc39.github.io/ecma262/2016/#sec-toboolean
        function ToBoolean(argument) {
            return !!argument;
        }
        // 7.1.12 ToString(argument)
        // https://tc39.github.io/ecma262/#sec-tostring
        function ToString(argument) {
            return "" + argument;
        }
        // 7.1.14 ToPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-topropertykey
        function ToPropertyKey(argument) {
            var key = ToPrimitive(argument, 3 /* String */);
            if (IsSymbol(key))
                return key;
            return ToString(key);
        }
        // 7.2 Testing and Comparison Operations
        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
        // 7.2.2 IsArray(argument)
        // https://tc39.github.io/ecma262/#sec-isarray
        function IsArray(argument) {
            return Array.isArray
                ? Array.isArray(argument)
                : argument instanceof Object
                    ? argument instanceof Array
                    : Object.prototype.toString.call(argument) === "[object Array]";
        }
        // 7.2.3 IsCallable(argument)
        // https://tc39.github.io/ecma262/#sec-iscallable
        function IsCallable(argument) {
            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
            return typeof argument === "function";
        }
        // 7.2.4 IsConstructor(argument)
        // https://tc39.github.io/ecma262/#sec-isconstructor
        function IsConstructor(argument) {
            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
            return typeof argument === "function";
        }
        // 7.2.7 IsPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-ispropertykey
        function IsPropertyKey(argument) {
            switch (Type(argument)) {
                case 3 /* String */: return true;
                case 4 /* Symbol */: return true;
                default: return false;
            }
        }
        // 7.3 Operations on Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-objects
        // 7.3.9 GetMethod(V, P)
        // https://tc39.github.io/ecma262/#sec-getmethod
        function GetMethod(V, P) {
            var func = V[P];
            if (func === undefined || func === null)
                return undefined;
            if (!IsCallable(func))
                throw new TypeError();
            return func;
        }
        // 7.4 Operations on Iterator Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
        function GetIterator(obj) {
            var method = GetMethod(obj, iteratorSymbol);
            if (!IsCallable(method))
                throw new TypeError(); // from Call
            var iterator = method.call(obj);
            if (!IsObject(iterator))
                throw new TypeError();
            return iterator;
        }
        // 7.4.4 IteratorValue(iterResult)
        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
        function IteratorValue(iterResult) {
            return iterResult.value;
        }
        // 7.4.5 IteratorStep(iterator)
        // https://tc39.github.io/ecma262/#sec-iteratorstep
        function IteratorStep(iterator) {
            var result = iterator.next();
            return result.done ? false : result;
        }
        // 7.4.6 IteratorClose(iterator, completion)
        // https://tc39.github.io/ecma262/#sec-iteratorclose
        function IteratorClose(iterator) {
            var f = iterator["return"];
            if (f)
                f.call(iterator);
        }
        // 9.1 Ordinary Object Internal Methods and Internal Slots
        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
        function OrdinaryGetPrototypeOf(O) {
            var proto = Object.getPrototypeOf(O);
            if (typeof O !== "function" || O === functionPrototype)
                return proto;
            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
            // Try to determine the superclass constructor. Compatible implementations
            // must either set __proto__ on a subclass constructor to the superclass constructor,
            // or ensure each class has a valid `constructor` property on its prototype that
            // points back to the constructor.
            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
            // This is the case when in ES6 or when using __proto__ in a compatible browser.
            if (proto !== functionPrototype)
                return proto;
            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
            var prototype = O.prototype;
            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
            if (prototypeProto == null || prototypeProto === Object.prototype)
                return proto;
            // If the constructor was not a function, then we cannot determine the heritage.
            var constructor = prototypeProto.constructor;
            if (typeof constructor !== "function")
                return proto;
            // If we have some kind of self-reference, then we cannot determine the heritage.
            if (constructor === O)
                return proto;
            // we have a pretty good guess at the heritage.
            return constructor;
        }
        // naive Map shim
        function CreateMapPolyfill() {
            var cacheSentinel = {};
            var arraySentinel = [];
            var MapIterator = /** @class */ (function () {
                function MapIterator(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                MapIterator.prototype["@@iterator"] = function () { return this; };
                MapIterator.prototype[iteratorSymbol] = function () { return this; };
                MapIterator.prototype.next = function () {
                    var index = this._index;
                    if (index >= 0 && index < this._keys.length) {
                        var result = this._selector(this._keys[index], this._values[index]);
                        if (index + 1 >= this._keys.length) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        else {
                            this._index++;
                        }
                        return { value: result, done: false };
                    }
                    return { value: undefined, done: true };
                };
                MapIterator.prototype.throw = function (error) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    throw error;
                };
                MapIterator.prototype.return = function (value) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    return { value: value, done: true };
                };
                return MapIterator;
            }());
            return /** @class */ (function () {
                function Map() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                Object.defineProperty(Map.prototype, "size", {
                    get: function () { return this._keys.length; },
                    enumerable: true,
                    configurable: true
                });
                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                Map.prototype.get = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    return index >= 0 ? this._values[index] : undefined;
                };
                Map.prototype.set = function (key, value) {
                    var index = this._find(key, /*insert*/ true);
                    this._values[index] = value;
                    return this;
                };
                Map.prototype.delete = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    if (index >= 0) {
                        var size = this._keys.length;
                        for (var i = index + 1; i < size; i++) {
                            this._keys[i - 1] = this._keys[i];
                            this._values[i - 1] = this._values[i];
                        }
                        this._keys.length--;
                        this._values.length--;
                        if (key === this._cacheKey) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                };
                Map.prototype.clear = function () {
                    this._keys.length = 0;
                    this._values.length = 0;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                };
                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                Map.prototype["@@iterator"] = function () { return this.entries(); };
                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                Map.prototype._find = function (key, insert) {
                    if (this._cacheKey !== key) {
                        this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                    }
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    return this._cacheIndex;
                };
                return Map;
            }());
            function getKey(key, _) {
                return key;
            }
            function getValue(_, value) {
                return value;
            }
            function getEntry(key, value) {
                return [key, value];
            }
        }
        // naive Set shim
        function CreateSetPolyfill() {
            return /** @class */ (function () {
                function Set() {
                    this._map = new _Map();
                }
                Object.defineProperty(Set.prototype, "size", {
                    get: function () { return this._map.size; },
                    enumerable: true,
                    configurable: true
                });
                Set.prototype.has = function (value) { return this._map.has(value); };
                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                Set.prototype.delete = function (value) { return this._map.delete(value); };
                Set.prototype.clear = function () { this._map.clear(); };
                Set.prototype.keys = function () { return this._map.keys(); };
                Set.prototype.values = function () { return this._map.values(); };
                Set.prototype.entries = function () { return this._map.entries(); };
                Set.prototype["@@iterator"] = function () { return this.keys(); };
                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                return Set;
            }());
        }
        // naive WeakMap shim
        function CreateWeakMapPolyfill() {
            var UUID_SIZE = 16;
            var keys = HashMap.create();
            var rootKey = CreateUniqueKey();
            return /** @class */ (function () {
                function WeakMap() {
                    this._key = CreateUniqueKey();
                }
                WeakMap.prototype.has = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                };
                WeakMap.prototype.get = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
                };
                WeakMap.prototype.set = function (target, value) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                    table[this._key] = value;
                    return this;
                };
                WeakMap.prototype.delete = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? delete table[this._key] : false;
                };
                WeakMap.prototype.clear = function () {
                    // NOTE: not a real clear, just makes the previous data unreachable
                    this._key = CreateUniqueKey();
                };
                return WeakMap;
            }());
            function CreateUniqueKey() {
                var key;
                do
                    key = "@@WeakMap@@" + CreateUUID();
                while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }
            function GetOrCreateWeakMapTable(target, create) {
                if (!hasOwn.call(target, rootKey)) {
                    if (!create)
                        return undefined;
                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
                }
                return target[rootKey];
            }
            function FillRandomBytes(buffer, size) {
                for (var i = 0; i < size; ++i)
                    buffer[i] = Math.random() * 0xff | 0;
                return buffer;
            }
            function GenRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    if (typeof crypto !== "undefined")
                        return crypto.getRandomValues(new Uint8Array(size));
                    if (typeof msCrypto !== "undefined")
                        return msCrypto.getRandomValues(new Uint8Array(size));
                    return FillRandomBytes(new Uint8Array(size), size);
                }
                return FillRandomBytes(new Array(size), size);
            }
            function CreateUUID() {
                var data = GenRandomBytes(UUID_SIZE);
                // mark as random - RFC 4122 § 4.4
                data[6] = data[6] & 0x4f | 0x40;
                data[8] = data[8] & 0xbf | 0x80;
                var result = "";
                for (var offset = 0; offset < UUID_SIZE; ++offset) {
                    var byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8)
                        result += "-";
                    if (byte < 16)
                        result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
        }
        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
        function MakeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
    });
})(Reflect || (Reflect = {}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
(() => {
"use strict";

;// CONCATENATED MODULE: ./node_modules/tslib/tslib.es6.js
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return __assign.apply(this, arguments);
}

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
    return ar;
}

/** @deprecated */
function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
}

function __importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
}

function __classPrivateFieldSet(receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
}

// EXTERNAL MODULE: ./node_modules/reflect-metadata/Reflect.js
var reflect_metadata_Reflect = __webpack_require__(660);
;// CONCATENATED MODULE: ./ts/Utils/DI.ts

class IRegistrator {
}
var Scope;
(function (Scope) {
    Scope[Scope["SingleInstance"] = 0] = "SingleInstance";
    Scope[Scope["InstancePerDependency"] = 1] = "InstancePerDependency";
    Scope[Scope["ExistingInstance"] = 2] = "ExistingInstance";
})(Scope || (Scope = {}));
class RegistrationCompletedError extends Error {
    constructor() {
        super("Registration process has been completed. No more new registrations can be done.");
        this.name = "RegistrationCompletedError";
        Object.setPrototypeOf(this, RegistrationCompletedError.prototype);
    }
}
class ResolveFailedError extends Error {
    constructor(abstraction) {
        super(`DependencyInjector could not resolve type: ${abstraction}.`);
        this.name = "ResolveFailedError";
        Object.setPrototypeOf(this, ResolveFailedError.prototype);
    }
}
class DependencyInjector {
    constructor() {
        this._registrationCompleted = false;
        this._registrations = new Map();
        this._resolvedInstances = new WeakMap();
    }
    register(abstraction, implementaion, parameterTypes = new Array(), scope = Scope.SingleInstance) {
        if (!this._registrationCompleted) {
            this._registrations.set(abstraction, { implementaion: implementaion, parameterTypes: parameterTypes, scope: scope });
        }
        else {
            throw new RegistrationCompletedError();
        }
    }
    resolve(abstraction) {
        if (!this._registrationCompleted) {
            this.resolveInternal(IRegistrator);
            this._registrationCompleted = true;
        }
        let result = this.resolveInternal(abstraction);
        if (result !== undefined) {
            return result;
        }
        else
            throw new ResolveFailedError(abstraction);
    }
    resolveInternal(abstraction) {
        let implementaionOptions = this._registrations.get(abstraction), resolvedInstance;
        if (implementaionOptions) {
            if (implementaionOptions.scope === Scope.SingleInstance || implementaionOptions.scope === Scope.ExistingInstance) {
                resolvedInstance = this._resolvedInstances.get(abstraction);
                if (resolvedInstance === undefined && implementaionOptions.scope === Scope.ExistingInstance) {
                    this._registrations.forEach((otherOptions, otherAbstraction) => {
                        if (resolvedInstance === undefined && otherOptions.implementaion === implementaionOptions.implementaion) {
                            resolvedInstance = this._resolvedInstances.get(otherAbstraction);
                        }
                    });
                    if (resolvedInstance !== undefined) {
                        this._resolvedInstances.set(abstraction, resolvedInstance);
                    }
                }
            }
            if (resolvedInstance === undefined && implementaionOptions.scope !== Scope.ExistingInstance) {
                let resolvedParameters = implementaionOptions.parameterTypes.map(p => this.resolveInternal(p));
                resolvedInstance = new implementaionOptions.implementaion(...resolvedParameters);
                if (implementaionOptions.scope === Scope.SingleInstance) {
                    this._resolvedInstances.set(abstraction, resolvedInstance);
                }
            }
            return resolvedInstance;
        }
        else if (abstraction === IRegistrator) {
            return undefined;
        }
        throw new ResolveFailedError(abstraction);
    }
}
const Container = new DependencyInjector();
function injectable(abstraction, scope = Scope.SingleInstance) {
    return (constructor) => {
        let constructorParameterTypes = Reflect.getMetadata("design:paramtypes", constructor);
        Container.register(abstraction || constructor, constructor, constructorParameterTypes, scope);
    };
}

;// CONCATENATED MODULE: ./ts/BackgroundPage/IApplicationInstaller.ts
class IApplicationInstaller {
}

;// CONCATENATED MODULE: ./ts/Settings/IApplicationSettings.ts
var BrowserName;
(function (BrowserName) {
    BrowserName["Chrome"] = "Chrome";
    BrowserName["Firefox"] = "Firefox";
})(BrowserName || (BrowserName = {}));
var BrowserVendor;
(function (BrowserVendor) {
    BrowserVendor["Google"] = "Google";
    BrowserVendor["Mozilla"] = "Mozilla";
    BrowserVendor["Microsoft"] = "Microsoft";
    BrowserVendor["Vivaldi"] = "Vivaldi";
    BrowserVendor["Yandex"] = "Yandex";
    BrowserVendor["Opera"] = "Opera";
    BrowserVendor["UC"] = "UC";
})(BrowserVendor || (BrowserVendor = {}));
class IApplicationSettings {
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromePromise.ts
var ChromePromise_1;


let ChromePromise = ChromePromise_1 = class ChromePromise {
    constructor() {
        if (typeof browser === "object") {
            return browser;
        }
        this.fillProperties(chrome, this);
    }
    setPromiseFunction(fn, thisArg) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                Array.prototype.push.call(args, callback);
                fn.apply(thisArg, args);
                function callback(...results) {
                    let err = chrome.runtime.lastError;
                    if (err) {
                        reject(err);
                    }
                    else {
                        switch (results.length) {
                            case 0:
                                resolve(undefined);
                                break;
                            case 1:
                                resolve(results[0]);
                                break;
                            default:
                                resolve(results);
                        }
                    }
                }
            });
        };
    }
    fillProperties(source, target) {
        for (let key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                let val = source[key];
                let type = typeof val;
                if (type === 'object' && !(val instanceof ChromePromise_1)) {
                    target[key] = {};
                    this.fillProperties(val, target[key]);
                }
                else if (type === 'function') {
                    target[key] = this.setPromiseFunction(val, source);
                }
                else {
                    target[key] = val;
                }
            }
        }
    }
};
ChromePromise = ChromePromise_1 = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], ChromePromise);

var Commands;
(function (Commands) {
})(Commands || (Commands = {}));
var Tabs;
(function (Tabs) {
})(Tabs || (Tabs = {}));
var Runtime;
(function (Runtime) {
})(Runtime || (Runtime = {}));
var Storage;
(function (Storage) {
})(Storage || (Storage = {}));

;// CONCATENATED MODULE: ./ts/Chrome/ChromeApplicationInstaller.ts





let ChromeApplicationInstaller = class ChromeApplicationInstaller {
    constructor(_chromePromise, _app) {
        this._chromePromise = _chromePromise;
        this._app = _app;
        this.printError = (er) => this._app.isDebug && console.error(er.message || er);
        if (_app.browserName !== BrowserName.Firefox) {
            chrome.runtime.onInstalled.addListener(this.onInstalled.bind(this));
        }
    }
    onInstalled(e) {
        setTimeout(() => {
            const mainInjection = chrome.runtime.getManifest().content_scripts[0];
            this._chromePromise.tabs
                .query({})
                .then(tabs => tabs.map(tab => {
                for (const css of mainInjection.css) {
                    this._chromePromise.tabs
                        .insertCSS(tab.id, {
                        allFrames: true,
                        matchAboutBlank: true,
                        runAt: mainInjection.run_at,
                        file: css
                    })
                        .catch(this.printError);
                }
                this._chromePromise.tabs
                    .executeScript(tab.id, {
                    allFrames: true,
                    matchAboutBlank: true,
                    runAt: "document_idle",
                    file: mainInjection.js[0]
                })
                    .catch(this.printError);
            }))
                .catch(this.printError);
        }, this._app.isDebug ? 3000 : 100);
    }
};
ChromeApplicationInstaller = __decorate([
    injectable(IApplicationInstaller),
    __metadata("design:paramtypes", [ChromePromise,
        IApplicationSettings])
], ChromeApplicationInstaller);


;// CONCATENATED MODULE: ./ts/Events/Event.ts
var EventHandlerPriority;
(function (EventHandlerPriority) {
    EventHandlerPriority[EventHandlerPriority["High"] = 1] = "High";
    EventHandlerPriority[EventHandlerPriority["Normal"] = 2] = "Normal";
    EventHandlerPriority[EventHandlerPriority["Low"] = 3] = "Low";
    EventHandlerPriority[EventHandlerPriority["After"] = 4] = "After";
})(EventHandlerPriority || (EventHandlerPriority = {}));
class ArgumentedEvent {
    constructor(_dispatcher) {
        this._dispatcher = _dispatcher;
    }
    addListener(handler, thisArg, priority = EventHandlerPriority.Normal, ...args) {
        return this._dispatcher.addListener(handler, thisArg, priority, ...args);
    }
    removeListener(handler, thisArg) {
        this._dispatcher.removeListener(handler, thisArg);
    }
    removeAllListeners() {
        this._dispatcher.removeAllListeners();
    }
}
class ResponsiveEvent {
    constructor(dispatcher) {
        this.dispatcher = dispatcher;
    }
    addListener(handler, thisArg, priority = EventHandlerPriority.Normal, ...args) {
        this.dispatcher.addListener(handler, thisArg, priority, ...args);
    }
    removeListener(handler, thisArg) {
        this.dispatcher.removeListener(handler, thisArg);
    }
    removeAllListeners() {
        this.dispatcher.removeAllListeners();
    }
}

;// CONCATENATED MODULE: ./ts/Utils/Enum.ts
function getEnumValues(enumType) {
    return Object.values(enumType)
        .filter(key => !isNaN(Number(key)));
}
function getEnumNames(enumType) {
    return Object.keys(enumType)
        .filter(key => isNaN(Number(key)));
}

;// CONCATENATED MODULE: ./ts/Events/EventDispatcher.ts


class ArgumentedEventDispatcher {
    constructor() {
        this._handlers = new Map();
        this.event = new ArgumentedEvent(this);
    }
    addListener(handler, thisArg, priority = EventHandlerPriority.Normal, ...args) {
        this.removeListener(handler, thisArg);
        let handlersInPriority = this._handlers.get(priority);
        if (handlersInPriority === undefined) {
            handlersInPriority = new Map();
            this._handlers.set(priority, handlersInPriority);
        }
        let handlersInContext = handlersInPriority.get(thisArg);
        if (handlersInContext === undefined) {
            handlersInContext = new Map();
            handlersInPriority.set(thisArg, handlersInContext);
        }
        let boundHandler = thisArg || args.length > 0 ? handler.bind(thisArg, ...args) : handler;
        handlersInContext.set(handler, boundHandler);
        return boundHandler;
    }
    removeListener(handler, thisArg) {
        this._handlers.forEach((handlersInPriority, priority) => {
            let handlersInContext = handlersInPriority.get(thisArg);
            if (handlersInContext !== undefined) {
                handlersInContext.delete(handler);
                if (handlersInContext.size === 0) {
                    handlersInPriority.delete(thisArg);
                    if (handlersInPriority.size === 0) {
                        this._handlers.delete(priority);
                    }
                }
            }
        });
    }
    removeAllListeners() {
        this._handlers.clear();
    }
    raise(eventArgs) {
        let keys = new Set(this._handlers.keys());
        getEnumValues(EventHandlerPriority)
            .filter(priority => keys.has(priority))
            .map(priority => { return { priority: priority, contexts: this._handlers.get(priority) }; })
            .forEach(x => x.priority == EventHandlerPriority.After
            ? setTimeout((ctxt, ea, $this) => $this.executeHandler(ctxt, ea), 1, x.contexts, eventArgs, this)
            : this.executeHandler(x.contexts, eventArgs));
    }
    executeHandler(contexts, eventArgs) {
        contexts.forEach(context => context.forEach(boundHandler => boundHandler(eventArgs)));
    }
}
class ResponsiveEventDispatcher {
    constructor() {
        this._handlers = new Map();
        this.event = new ResponsiveEvent(this);
    }
    addListener(handler, thisArg, priority = EventHandlerPriority.Normal, ...args) {
        this.removeListener(handler, thisArg);
        let handlersInPriority = this._handlers.get(priority);
        if (handlersInPriority === undefined) {
            handlersInPriority = new Map();
            this._handlers.set(priority, handlersInPriority);
        }
        let handlersInContext = handlersInPriority.get(thisArg);
        if (handlersInContext === undefined) {
            handlersInContext = new Map();
            handlersInPriority.set(thisArg, handlersInContext);
        }
        let boundHandler = thisArg || args.length > 0 ? handler.bind(thisArg, ...args) : handler;
        handlersInContext.set(handler, boundHandler);
        return boundHandler;
    }
    removeListener(handler, thisArg) {
        this._handlers.forEach((handlersInPriority, priority) => {
            let handlersInContext = handlersInPriority.get(thisArg);
            if (handlersInContext !== undefined) {
                handlersInContext.delete(handler);
                if (handlersInContext.size === 0) {
                    handlersInPriority.delete(thisArg);
                    if (handlersInPriority.size === 0) {
                        this._handlers.delete(priority);
                    }
                }
            }
        });
    }
    removeAllListeners() {
        this._handlers.clear();
    }
    raise(response, eventArgs) {
        let keys = new Set(this._handlers.keys());
        getEnumValues(EventHandlerPriority)
            .filter(priority => keys.has(priority))
            .map(priority => { return { priority: priority, contexts: this._handlers.get(priority) }; })
            .forEach(x => x.priority == EventHandlerPriority.After
            ? setTimeout((ctxt, resp, ea, $this) => $this.executeHandler(ctxt, resp, ea), 1, x.contexts, response, eventArgs, this)
            : this.executeHandler(x.contexts, response, eventArgs));
    }
    executeHandler(contexts, response, eventArgs) {
        contexts.forEach(context => context.forEach(boundHandler => boundHandler(response, eventArgs)));
    }
}

;// CONCATENATED MODULE: ./ts/Settings/IStorageManager.ts
var StorageLimits;
(function (StorageLimits) {
    StorageLimits["QUOTA_BYTES"] = "QUOTA_BYTES";
    StorageLimits["QUOTA_BYTES_PER_ITEM"] = "QUOTA_BYTES_PER_ITEM";
    StorageLimits["MAX_ITEMS"] = "MAX_ITEMS";
    StorageLimits["MAX_WRITE_OPERATIONS_PER_HOUR"] = "MAX_WRITE_OPERATIONS_PER_HOUR";
    StorageLimits["MAX_WRITE_OPERATIONS_PER_MINUTE"] = "MAX_WRITE_OPERATIONS_PER_MINUTE";
})(StorageLimits || (StorageLimits = {}));
class IStorageManager {
}

;// CONCATENATED MODULE: ./ts/i18n/ITranslationAccessor.ts
class ITranslationAccessor {
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromeStorageManager.ts







const ArgEventDispatcher = ArgumentedEventDispatcher;
let ChromeStorageManager = class ChromeStorageManager {
    constructor(chromePromise, _app, _i18n) {
        this.chromePromise = chromePromise;
        this._app = _app;
        this._i18n = _i18n;
        this._onStorageChanged = new ArgEventDispatcher();
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if ("sync" in changes) {
                this.currentStorage = changes.sync.newValue ? "sync" : "local";
            }
            this._onStorageChanged.raise(changes);
        });
    }
    set(obj) {
        return this.getCurrentStorage()
            .then(storage => this.chromePromise.storage[storage].set(obj));
    }
    get(key) {
        return this.getCurrentStorage()
            .then(storage => this.chromePromise.storage[storage].get(key));
    }
    clear() {
        return this.getCurrentStorage()
            .then(storage => this.chromePromise.storage[storage].clear());
    }
    remove(key) {
        return this.getCurrentStorage()
            .then(storage => this.chromePromise.storage[storage].remove(key));
    }
    toggleSync(value) {
        return __awaiter(this, void 0, void 0, function* () {
            const newStorage = value ? "sync" : "local";
            const currStorage = yield this.getCurrentStorage();
            if (newStorage !== currStorage) {
                yield this.transferStorage(currStorage, newStorage);
                this.currentStorage = newStorage;
            }
            return this.chromePromise.storage.local.set({ sync: value });
        });
    }
    transferStorage(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const newStorageContent = yield this.chromePromise.storage[to].get(null);
            if (!newStorageContent || Object.keys(newStorageContent).length === 0 ||
                confirm(this._i18n.getMessage(`${to}StorageOverrideConfirmationMessage`))) {
                this.chromePromise.storage[to].set(yield this.chromePromise.storage[from].get(null));
            }
        });
    }
    getCurrentStorage() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentStorage) {
                return this.currentStorage;
            }
            else {
                const state = yield this.chromePromise.storage.local.get({ sync: !this._app.isDebug });
                this.currentStorage = state.sync ? "sync" : "local";
                return this.currentStorage;
            }
        });
    }
    get onStorageChanged() {
        return this._onStorageChanged.event;
    }
};
ChromeStorageManager = __decorate([
    injectable(IStorageManager),
    __metadata("design:paramtypes", [ChromePromise,
        IApplicationSettings,
        ITranslationAccessor])
], ChromeStorageManager);


;// CONCATENATED MODULE: ./ts/BackgroundPage/ICommandListener.ts
class ICommandListener {
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromeCommandListener.ts





let ChromeCommandListener = class ChromeCommandListener {
    constructor(app) {
        this._onCommand = new ArgumentedEventDispatcher();
        if (app.isDesktop) {
            chrome.commands.onCommand.addListener(command => {
                this._onCommand.raise(command);
            });
        }
    }
    get onCommand() {
        return this._onCommand.event;
    }
};
ChromeCommandListener = __decorate([
    injectable(ICommandListener),
    __metadata("design:paramtypes", [IApplicationSettings])
], ChromeCommandListener);


;// CONCATENATED MODULE: ./ts/Chrome/ChromeApplicationSettings.ts




let ChromeApplicationSettings = class ChromeApplicationSettings {
    constructor(_rootDocument, _chrome) {
        this._rootDocument = _rootDocument;
        this._chrome = _chrome;
        this._preserveDisplay = false;
        if (chrome.runtime.getManifest().update_url) {
            this._isDebug = false;
        }
        else {
            this._isDebug = true;
        }
        this._preserveDisplay = /facebook|baidu/gi.test(_rootDocument.location.hostname);
    }
    get isDebug() { return this._isDebug; }
    get isInIncognitoMode() { return chrome.extension.inIncognitoContext; }
    get currentLocale() {
        return chrome.runtime.getManifest().current_locale || "en";
    }
    get browserName() {
        return typeof browser === "object"
            ? BrowserName.Firefox
            : BrowserName.Chrome;
    }
    get browserVendor() {
        if (/Edg\//.test(navigator.userAgent)) {
            return BrowserVendor.Microsoft;
        }
        else if (/OPR/.test(navigator.userAgent)) {
            return BrowserVendor.Opera;
        }
        else if (/UBrowser/.test(navigator.userAgent)) {
            return BrowserVendor.UC;
        }
        else if (this.browserName === BrowserName.Firefox) {
            return BrowserVendor.Mozilla;
        }
        else {
            return BrowserVendor.Google;
        }
    }
    get isMobile() {
        return /mobile/gi.test(navigator.userAgent);
    }
    get isDesktop() {
        return !/mobile/gi.test(navigator.userAgent);
    }
    get preserveDisplay() { return this._preserveDisplay; }
    get version() { return chrome.runtime.getManifest().version; }
    get id() { return chrome.runtime.id; }
    getFullPath(relativePath) {
        return chrome.runtime.getURL(relativePath);
    }
    getStorageLimits(storage, limit) {
        return chrome.storage[storage][limit];
    }
};
ChromeApplicationSettings = __decorate([
    injectable(IApplicationSettings),
    __metadata("design:paramtypes", [Document,
        ChromePromise])
], ChromeApplicationSettings);


;// CONCATENATED MODULE: ./ts/Settings/SettingsRequestMessage.ts
var SettingsMessageAction;
(function (SettingsMessageAction) {
    SettingsMessageAction["GetCurrentSettings"] = "GetCurrentSettings";
    SettingsMessageAction["ApplyNewSettings"] = "ApplyNewSettings";
    SettingsMessageAction["DeleteSettings"] = "DeleteSettings";
    SettingsMessageAction["ToggleIsEnabled"] = "ToggleIsEnabled";
    SettingsMessageAction["ZoomChanged"] = "ZoomChanged";
    SettingsMessageAction["SettingsApplied"] = "SettingsApplied";
})(SettingsMessageAction || (SettingsMessageAction = {}));
class CurrentSettingsRequestMessage {
    constructor(sender) {
        this.sender = sender;
        this.action = SettingsMessageAction.GetCurrentSettings;
    }
}
class SettingsDeletionRequestMessage {
    constructor(sender) {
        this.sender = sender;
        this.action = SettingsMessageAction.DeleteSettings;
    }
}
class IsEnabledToggleRequestMessage {
    constructor(sender, isEnabled) {
        this.sender = sender;
        this.isEnabled = isEnabled;
        this.action = SettingsMessageAction.ToggleIsEnabled;
    }
}
class ZoomChangedMessage {
    constructor(sender, zoom) {
        this.sender = sender;
        this.zoom = zoom;
        this.action = SettingsMessageAction.ZoomChanged;
    }
}
class SettingsAppliedMessage {
    constructor(sender, settings) {
        this.sender = sender;
        this.settings = settings;
        this.action = SettingsMessageAction.SettingsApplied;
    }
}
class NewSettingsApplicationRequestMessage {
    constructor(sender, settings) {
        this.sender = sender;
        this.settings = settings;
        this.action = SettingsMessageAction.ApplyNewSettings;
    }
}

;// CONCATENATED MODULE: ./ts/Settings/ISettingsBus.ts
class ISettingsBus {
}

;// CONCATENATED MODULE: ./ts/Settings/ExtensionModule.ts
var ExtensionModule;
(function (ExtensionModule) {
    ExtensionModule["ContentScript"] = "Content Script";
    ExtensionModule["BackgroundPage"] = "Background Page";
    ExtensionModule["PopupWindow"] = "Popup Window";
    ExtensionModule["PageScript"] = "Page Script";
})(ExtensionModule || (ExtensionModule = {}));
class CurrentExtensionModule {
    constructor(name) {
        this.name = name;
    }
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromeSettingsBus.ts








const Action = SettingsMessageAction;
const EventDispatcher = ResponsiveEventDispatcher;
let ChromeSettingsBus = class ChromeSettingsBus {
    constructor(_app, _chromePromise, _document, _module) {
        this._app = _app;
        this._chromePromise = _chromePromise;
        this._document = _document;
        this._module = _module;
        this._onCurrentSettingsRequested = new EventDispatcher();
        this._onNewSettingsApplicationRequested = new EventDispatcher();
        this._onSettingsApplied = new EventDispatcher();
        this._onSettingsDeletionRequested = new EventDispatcher();
        this._onIsEnabledToggleRequested = new EventDispatcher();
        this._onZoomChanged = new EventDispatcher();
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (this._app.isDebug) {
                request.receiver = _module.name + " - " +
                    (window.top === window.self ? "Main frame" : "Child frame");
                console.log(request);
            }
            if (request.sender === ExtensionModule.PopupWindow ||
                request.sender === ExtensionModule.BackgroundPage) {
                if (window.top === window.self) {
                    switch (request.action) {
                        case Action.GetCurrentSettings:
                            this._onCurrentSettingsRequested.raise(sendResponse);
                            break;
                        default:
                            break;
                    }
                }
                switch (request.action) {
                    case Action.ApplyNewSettings:
                        this._onNewSettingsApplicationRequested.raise(sendResponse, request.settings);
                        break;
                    case Action.ToggleIsEnabled:
                        this._onIsEnabledToggleRequested.raise(sendResponse, request.isEnabled);
                        break;
                    case Action.ZoomChanged:
                        this._onZoomChanged.raise(sendResponse, request.zoom);
                        break;
                    case Action.DeleteSettings:
                        this._onSettingsDeletionRequested.raise(sendResponse);
                        break;
                    default:
                        break;
                }
            }
            if (this._module.name === ExtensionModule.BackgroundPage) {
                switch (request.action) {
                    case Action.SettingsApplied:
                        this._onSettingsApplied.raise(sendResponse, request.settings);
                        sendResponse(undefined);
                        break;
                    default:
                        break;
                }
            }
        });
    }
    get onCurrentSettingsRequested() {
        return this._onCurrentSettingsRequested.event;
    }
    get onNewSettingsApplicationRequested() {
        return this._onNewSettingsApplicationRequested.event;
    }
    get onSettingsApplied() {
        return this._onSettingsApplied.event;
    }
    get onSettingsDeletionRequested() {
        return this._onSettingsDeletionRequested.event;
    }
    get onIsEnabledToggleRequested() {
        return this._onIsEnabledToggleRequested.event;
    }
    get onZoomChanged() {
        return this._onZoomChanged.event;
    }
    sendMessage(msg) {
        return this._chromePromise.runtime.sendMessage(msg);
    }
    sendMessageToSelectedTab(msg) {
        return this._chromePromise.tabs.query({ active: true, currentWindow: true })
            .then(tabs => this._chromePromise.tabs.sendMessage(tabs[0].id, msg));
    }
    sendMessageToAllTabs(msg) {
        return this._chromePromise.tabs.query({}).then(tabs => tabs.map(tab => this._chromePromise.tabs.sendMessage(tab.id, msg)));
    }
    sendMessageToTab(tabId, msg) {
        return this._chromePromise.tabs.sendMessage(tabId, msg);
    }
    deleteSettings() {
        return this.sendMessageToSelectedTab(new SettingsDeletionRequestMessage(this._module.name));
    }
    applySettings(settings) {
        return this.sendMessageToSelectedTab(new NewSettingsApplicationRequestMessage(this._module.name, settings));
    }
    getCurrentSettings() {
        return this.sendMessageToSelectedTab(new CurrentSettingsRequestMessage(this._module.name));
    }
    toggleIsEnabled(isEnabled) {
        const msg = new IsEnabledToggleRequestMessage(this._module.name, isEnabled);
        return this.sendMessage(msg)
            .catch(ex => this._app.isDebug ? console.error(ex.message || ex) : null)
            .then(() => this.sendMessageToAllTabs(msg));
    }
    setTabZoom(tabId, zoom) {
        return this.sendMessageToTab(tabId, new ZoomChangedMessage(this._module.name, zoom));
    }
    notifySettingsApplied(settings) {
        if (window.top === window.self) {
            return this.sendMessage(new SettingsAppliedMessage(this._module.name, settings));
        }
        return Promise.resolve(settings);
    }
};
ChromeSettingsBus = __decorate([
    injectable(ISettingsBus),
    __metadata("design:paramtypes", [IApplicationSettings,
        ChromePromise,
        Document,
        CurrentExtensionModule])
], ChromeSettingsBus);


;// CONCATENATED MODULE: ./ts/Chrome/ChromeTranslationAccessor.ts



let ChromeTranslationAccessor = class ChromeTranslationAccessor {
    constructor() {
    }
    getMessage(messageKey, ...substitutions) {
        return chrome.i18n.getMessage(messageKey, substitutions);
    }
};
ChromeTranslationAccessor = __decorate([
    injectable(ITranslationAccessor),
    __metadata("design:paramtypes", [])
], ChromeTranslationAccessor);


;// CONCATENATED MODULE: ./ts/BackgroundPage/IBackgroundMessageBus.ts
class IBackgroundMessageBus {
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromeBackgroundMessageBus.ts





let ChromeBackgroundMessageBus = class ChromeBackgroundMessageBus {
    constructor(_app) {
        this._app = _app;
        this.connections = new Set();
        this._onMessage = new ArgumentedEventDispatcher();
        this._onConnected = new ArgumentedEventDispatcher();
        const handler = (port) => {
            if (!this.connections.has(port)) {
                this.connections.add(port);
                port.onDisconnect.addListener(closedPort => this.connections.delete(closedPort));
                port.onMessage.addListener(message => {
                    if (_app.isDebug) {
                        console.log(message);
                    }
                    this._onMessage.raise({ port, message });
                });
                this._onConnected.raise(port);
            }
        };
        chrome.runtime.onConnect.addListener(handler);
    }
    get onMessage() {
        return this._onMessage.event;
    }
    get onConnected() {
        return this._onConnected.event;
    }
    postMessage(port, message) {
        if (this._app.isDebug) {
            console.log(message);
        }
        port.postMessage(message);
    }
    broadcastMessage(message, portType) {
        if (this._app.isDebug) {
            console.log(message);
        }
        for (const port of this.connections) {
            if (port.name === portType) {
                port.postMessage(message);
            }
        }
    }
};
ChromeBackgroundMessageBus = __decorate([
    injectable(IBackgroundMessageBus),
    __metadata("design:paramtypes", [IApplicationSettings])
], ChromeBackgroundMessageBus);


;// CONCATENATED MODULE: ./ts/BackgroundPage/CommandProcessor.ts





class ICommandProcessor {
}
let CommandProcessor = class CommandProcessor {
    constructor(commandListener, _settingsBus, _storageManager) {
        this._settingsBus = _settingsBus;
        this._storageManager = _storageManager;
        commandListener.onCommand.addListener(this.processCommand, this);
    }
    processCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(command);
            switch (command) {
                case "global-toggle":
                    this._storageManager.get({ isEnabled: true })
                        .then(global => {
                        this._storageManager.set({ isEnabled: !global.isEnabled });
                        this._settingsBus.toggleIsEnabled(!global.isEnabled)
                            .then(tabRequests => tabRequests
                            .forEach(req => req
                            .catch(ex => console.error("Toggle request to the tab faild with: " + ex.message || 0))));
                    });
                    break;
                case "current-toggle":
                    try {
                        const currentSettings = yield this._settingsBus.getCurrentSettings();
                        currentSettings.runOnThisSite = !currentSettings.runOnThisSite;
                        this._settingsBus.applySettings(currentSettings);
                    }
                    catch (ex) {
                        console.error("Current website toggle request to the tab faild with: " + ex.message || 0);
                    }
                    break;
                default:
                    break;
            }
        });
    }
};
CommandProcessor = __decorate([
    injectable(ICommandProcessor),
    __metadata("design:paramtypes", [ICommandListener,
        ISettingsBus,
        IStorageManager])
], CommandProcessor);


;// CONCATENATED MODULE: ./ts/BackgroundPage/IZoomService.ts
class IZoomService {
}

;// CONCATENATED MODULE: ./ts/BackgroundPage/IUninstallUrlSetter.ts
class IUninstallUrlSetter {
}

;// CONCATENATED MODULE: ./ts/BackgroundPage/IThemeProcessor.ts
class IThemeProcessor {
}

;// CONCATENATED MODULE: ./ts/Settings/Messages.ts
var MessageType;
(function (MessageType) {
    MessageType["GetInstalledPublicSchemes"] = "GetInstalledPublicSchemes";
    MessageType["InstallPublicScheme"] = "InstallPublicScheme";
    MessageType["PublicSchemesChanged"] = "PublicSchemesChanged";
    MessageType["UninstallPublicScheme"] = "UninstallPublicScheme";
    MessageType["ApplyPublicScheme"] = "ApplyPublicScheme";
    MessageType["SetPublicSchemeAsDefault"] = "SetPublicSchemeAsDefault";
    MessageType["ErrorMessage"] = "ErrorMessage";
    MessageType["FetchImage"] = "FetchImage";
    MessageType["ImageFetchFailed"] = "ImageFetchFailed";
    MessageType["ImageFetchCompleted"] = "ImageFetchCompleted";
    MessageType["FetchExternalCss"] = "FetchExternalCss";
    MessageType["PageScriptLoaded"] = "PageScriptLoaded";
    MessageType["ExternalCssFetchCompleted"] = "ExternalCssFetchCompleted";
    MessageType["ExternalCssFetchFailed"] = "ExternalCssFetchFailed";
})(MessageType || (MessageType = {}));
class GetInstalledPublicSchemes {
    constructor() {
        this.type = MessageType.GetInstalledPublicSchemes;
    }
}
class InstallPublicSchemeCommand {
    constructor(publicScheme) {
        this.publicScheme = publicScheme;
        this.type = MessageType.InstallPublicScheme;
    }
}
class UninstallPublicSchemeCommand {
    constructor(publicSchemeId) {
        this.publicSchemeId = publicSchemeId;
        this.type = MessageType.UninstallPublicScheme;
    }
}
class ApplyPublicSchemeCommand {
    constructor(publicSchemeId, hostName) {
        this.publicSchemeId = publicSchemeId;
        this.hostName = hostName;
        this.type = MessageType.ApplyPublicScheme;
    }
}
class SetPublicSchemeAsDefaultCommand {
    constructor(publicSchemeId) {
        this.publicSchemeId = publicSchemeId;
        this.type = MessageType.SetPublicSchemeAsDefault;
    }
}
class PublicSchemesChanged {
    constructor(publicSchemeIds) {
        this.publicSchemeIds = publicSchemeIds;
        this.type = MessageType.PublicSchemesChanged;
    }
}
class ErrorMessage {
    constructor(errorMessage, details) {
        this.errorMessage = errorMessage;
        this.details = details;
        this.type = MessageType.ErrorMessage;
    }
}
class FetchImage {
    constructor(url, maxSize) {
        this.url = url;
        this.maxSize = maxSize;
        this.type = MessageType.FetchImage;
    }
}
class FetchExternalCss {
    constructor(url) {
        this.url = url;
        this.type = MessageType.FetchExternalCss;
    }
}
class ExternalCssFetchCompleted {
    constructor(url, cssText) {
        this.url = url;
        this.cssText = cssText;
        this.type = MessageType.ExternalCssFetchCompleted;
    }
}
class ExternalCssFetchFailed {
    constructor(url, error) {
        this.url = url;
        this.error = error;
        this.type = MessageType.ExternalCssFetchFailed;
    }
}
class PageScriptLoaded {
    constructor() {
        this.type = MessageType.PageScriptLoaded;
    }
}
class ImageFetchCompleted {
    constructor(url, img) {
        this.url = url;
        this.img = img;
        this.type = MessageType.ImageFetchCompleted;
    }
}
class ImageFetchFailed {
    constructor(url, error) {
        this.url = url;
        this.error = error;
        this.type = MessageType.ImageFetchFailed;
    }
}

;// CONCATENATED MODULE: ./ts/Settings/ColorScheme.ts
var ProcessingMode;
(function (ProcessingMode) {
    ProcessingMode["Automatic"] = "auto";
    ProcessingMode["Simplified"] = "simple";
    ProcessingMode["Complex"] = "complex";
    ProcessingMode["Filter"] = "filter";
})(ProcessingMode || (ProcessingMode = {}));
var SystemSchedule;
(function (SystemSchedule) {
    SystemSchedule["Dark"] = "sys-dark";
    SystemSchedule["Light"] = "sys-light";
})(SystemSchedule || (SystemSchedule = {}));
var ColorSchemeNamePrefix;
(function (ColorSchemeNamePrefix) {
    ColorSchemeNamePrefix["FromFile"] = "\uD83D\uDCC4 ";
    ColorSchemeNamePrefix["Public"] = "\u2601 ";
    ColorSchemeNamePrefix["Unsaved"] = "\uD83D\uDD89 ";
})(ColorSchemeNamePrefix || (ColorSchemeNamePrefix = {}));
const excludeSettingsForExport = (/* unused pure expression or super */ null && ([
    "isEnabled", "location", "userColorSchemes", "userColorSchemeIds",
    "changeBrowserTheme", "restoreColorsOnCopy", "restoreColorsOnPrint"
]));
const excludeSettingsForSave = (/* unused pure expression or super */ null && ([
    "isEnabled", "location", "colorSchemeName", "userColorSchemes",
    "userColorSchemeIds", "changeBrowserTheme", "restoreColorsOnCopy",
    "restoreColorsOnPrint"
]));
const excludeSettingsForCompare = [
    "isEnabled", "location", "colorSchemeId", "colorSchemeName",
    "userColorSchemes", "userColorSchemeIds", "runOnThisSite",
    "changeBrowserTheme", "restoreColorsOnCopy", "restoreColorsOnPrint"
];

;// CONCATENATED MODULE: ./ts/Settings/ColorSchemes.ts

const CustomColorSchemeId = "custom";
const ColorSchemes = {};
const DefaultColorSchemes = {
    userColorSchemes: [
        {
            userColorSchemes: [],
            userColorSchemeIds: [],
            colorSchemeId: "default",
            colorSchemeName: "Default",
            runOnThisSite: true,
            isEnabled: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            changeBrowserTheme: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 100,
            backgroundContrast: 0,
            backgroundLightnessLimit: 100,
            backgroundGraySaturation: 0,
            backgroundGrayHue: 0,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 100,
            buttonContrast: 0,
            buttonLightnessLimit: 100,
            buttonGraySaturation: 0,
            buttonGrayHue: 0,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 100,
            textContrast: 0,
            textLightnessLimit: 100,
            textGraySaturation: 0,
            textGrayHue: 0,
            textSelectionHue: 0,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 100,
            linkContrast: 0,
            linkLightnessLimit: 100,
            linkDefaultSaturation: 0,
            linkDefaultHue: 0,
            linkVisitedHue: 0,
            linkReplaceAllHues: false,
            linkHueGravity: 0,
            borderSaturationLimit: 100,
            borderContrast: 0,
            borderLightnessLimit: 100,
            borderGraySaturation: 0,
            borderGrayHue: 0,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 100,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 100,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 0,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 100,
            scrollbarGrayHue: 0,
            scrollbarSize: 0,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "original",
            colorSchemeName: "Original (none)",
            runOnThisSite: false,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: false,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 0,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 100,
            backgroundContrast: 0,
            backgroundLightnessLimit: 100,
            backgroundGraySaturation: 0,
            backgroundGrayHue: 0,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 100,
            buttonContrast: 0,
            buttonLightnessLimit: 100,
            buttonGraySaturation: 0,
            buttonGrayHue: 0,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 100,
            textContrast: 0,
            textLightnessLimit: 100,
            textGraySaturation: 0,
            textGrayHue: 0,
            textSelectionHue: 0,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 100,
            linkContrast: 0,
            linkLightnessLimit: 100,
            linkDefaultSaturation: 0,
            linkDefaultHue: 0,
            linkVisitedHue: 0,
            linkReplaceAllHues: false,
            linkHueGravity: 0,
            borderSaturationLimit: 100,
            borderContrast: 0,
            borderLightnessLimit: 100,
            borderGraySaturation: 0,
            borderGrayHue: 0,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 100,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 100,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: false,
            maxBackgroundImageSize: 0,
            scrollbarSaturationLimit: 0,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 100,
            scrollbarGrayHue: 0,
            scrollbarSize: 0,
            scrollbarStyle: false
        },
        {
            colorSchemeId: "dimmedDust",
            colorSchemeName: "Dimmed Dust",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 70,
            backgroundContrast: 50,
            backgroundLightnessLimit: 14,
            backgroundGraySaturation: 5,
            backgroundGrayHue: 200,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 80,
            buttonContrast: 4,
            buttonLightnessLimit: 17,
            buttonGraySaturation: 10,
            buttonGrayHue: 190,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 90,
            textContrast: 66,
            textLightnessLimit: 90,
            textGraySaturation: 10,
            textGrayHue: 22,
            textSelectionHue: 207,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 80,
            linkContrast: 55,
            linkLightnessLimit: 75,
            linkDefaultSaturation: 74,
            linkDefaultHue: 207,
            linkVisitedHue: 262,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 80,
            borderContrast: 30,
            borderLightnessLimit: 50,
            borderGraySaturation: 10,
            borderGrayHue: 16,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 80,
            imageSaturationLimit: 90,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 80,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 5,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 40,
            scrollbarGrayHue: 16,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "appleMint",
            colorSchemeName: "Apple Mint",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 60,
            backgroundContrast: 50,
            backgroundLightnessLimit: 14,
            backgroundGraySaturation: 60,
            backgroundGrayHue: 170,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 80,
            buttonSaturationLimit: 60,
            buttonContrast: 3,
            buttonLightnessLimit: 16,
            buttonGraySaturation: 50,
            buttonGrayHue: 164,
            buttonReplaceAllHues: false,
            buttonHueGravity: 80,
            textSaturationLimit: 60,
            textContrast: 65,
            textLightnessLimit: 95,
            textGraySaturation: 20,
            textGrayHue: 88,
            textSelectionHue: 88,
            textReplaceAllHues: false,
            textHueGravity: 80,
            linkSaturationLimit: 60,
            linkContrast: 60,
            linkLightnessLimit: 80,
            linkDefaultSaturation: 60,
            linkDefaultHue: 85,
            linkVisitedHue: 34,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 60,
            borderContrast: 30,
            borderLightnessLimit: 50,
            borderGraySaturation: 10,
            borderGrayHue: 130,
            borderReplaceAllHues: false,
            borderHueGravity: 80,
            imageLightnessLimit: 80,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 10,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 40,
            scrollbarGrayHue: 133,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "kappaDream",
            colorSchemeName: "Kappa Dream",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 60,
            backgroundContrast: 50,
            backgroundLightnessLimit: 15,
            backgroundGraySaturation: 30,
            backgroundGrayHue: 122,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 80,
            buttonSaturationLimit: 60,
            buttonContrast: 4,
            buttonLightnessLimit: 18,
            buttonGraySaturation: 40,
            buttonGrayHue: 110,
            buttonReplaceAllHues: false,
            buttonHueGravity: 80,
            textSaturationLimit: 60,
            textContrast: 65,
            textLightnessLimit: 95,
            textGraySaturation: 30,
            textGrayHue: 72,
            textSelectionHue: 132,
            textReplaceAllHues: false,
            textHueGravity: 80,
            linkSaturationLimit: 60,
            linkContrast: 55,
            linkLightnessLimit: 80,
            linkDefaultSaturation: 70,
            linkDefaultHue: 68,
            linkVisitedHue: 34,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 60,
            borderContrast: 30,
            borderLightnessLimit: 50,
            borderGraySaturation: 20,
            borderGrayHue: 82,
            borderReplaceAllHues: false,
            borderHueGravity: 80,
            imageLightnessLimit: 80,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 20,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 40,
            scrollbarGrayHue: 120,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "almondRipe",
            colorSchemeName: "Almond Ripe",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 5,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 60,
            backgroundContrast: 50,
            backgroundLightnessLimit: 11,
            backgroundGraySaturation: 30,
            backgroundGrayHue: 36,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 80,
            buttonSaturationLimit: 60,
            buttonContrast: 3,
            buttonLightnessLimit: 13,
            buttonGraySaturation: 50,
            buttonGrayHue: 18,
            buttonReplaceAllHues: false,
            buttonHueGravity: 80,
            textSaturationLimit: 60,
            textContrast: 64,
            textLightnessLimit: 85,
            textGraySaturation: 10,
            textGrayHue: 90,
            textSelectionHue: 32,
            textReplaceAllHues: false,
            textHueGravity: 80,
            linkSaturationLimit: 60,
            linkContrast: 50,
            linkLightnessLimit: 75,
            linkDefaultSaturation: 60,
            linkDefaultHue: 88,
            linkVisitedHue: 36,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 60,
            borderContrast: 30,
            borderLightnessLimit: 50,
            borderGraySaturation: 20,
            borderGrayHue: 60,
            borderReplaceAllHues: false,
            borderHueGravity: 80,
            imageLightnessLimit: 80,
            imageSaturationLimit: 90,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 80,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 20,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 40,
            scrollbarGrayHue: 45,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "sunsetSails",
            colorSchemeName: "Sunset Sails",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 30,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 80,
            backgroundContrast: 50,
            backgroundLightnessLimit: 15,
            backgroundGraySaturation: 30,
            backgroundGrayHue: 4,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 20,
            buttonSaturationLimit: 80,
            buttonContrast: 4,
            buttonLightnessLimit: 18,
            buttonGraySaturation: 40,
            buttonGrayHue: 14,
            buttonReplaceAllHues: false,
            buttonHueGravity: 20,
            textSaturationLimit: 90,
            textContrast: 64,
            textLightnessLimit: 90,
            textGraySaturation: 20,
            textGrayHue: 45,
            textSelectionHue: 322,
            textReplaceAllHues: false,
            textHueGravity: 20,
            linkSaturationLimit: 70,
            linkContrast: 55,
            linkLightnessLimit: 80,
            linkDefaultSaturation: 70,
            linkDefaultHue: 45,
            linkVisitedHue: 14,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 80,
            borderContrast: 30,
            borderLightnessLimit: 50,
            borderGraySaturation: 20,
            borderGrayHue: 14,
            borderReplaceAllHues: false,
            borderHueGravity: 20,
            imageLightnessLimit: 80,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 20,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 40,
            scrollbarGrayHue: 36,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "halloween",
            colorSchemeName: "Halloween",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 70,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 80,
            backgroundContrast: 60,
            backgroundLightnessLimit: 7,
            backgroundGraySaturation: 80,
            backgroundGrayHue: 16,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 20,
            buttonSaturationLimit: 80,
            buttonContrast: 4,
            buttonLightnessLimit: 12,
            buttonGraySaturation: 80,
            buttonGrayHue: 14,
            buttonReplaceAllHues: false,
            buttonHueGravity: 20,
            textSaturationLimit: 90,
            textContrast: 70,
            textLightnessLimit: 100,
            textGraySaturation: 80,
            textGrayHue: 30,
            textSelectionHue: 324,
            textReplaceAllHues: false,
            textHueGravity: 20,
            linkSaturationLimit: 90,
            linkContrast: 60,
            linkLightnessLimit: 100,
            linkDefaultSaturation: 80,
            linkDefaultHue: 60,
            linkVisitedHue: 330,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 80,
            borderContrast: 30,
            borderLightnessLimit: 60,
            borderGraySaturation: 100,
            borderGrayHue: 4,
            borderReplaceAllHues: false,
            borderHueGravity: 20,
            imageLightnessLimit: 80,
            imageSaturationLimit: 90,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 80,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 30,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 20,
            scrollbarGrayHue: 16,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "morningMist",
            colorSchemeName: "Morning Mist",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 90,
            backgroundContrast: 50,
            backgroundLightnessLimit: 90,
            backgroundGraySaturation: 10,
            backgroundGrayHue: 200,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 90,
            buttonContrast: 10,
            buttonLightnessLimit: 85,
            buttonGraySaturation: 30,
            buttonGrayHue: 200,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 90,
            textContrast: 60,
            textLightnessLimit: 100,
            textGraySaturation: 20,
            textGrayHue: 194,
            textSelectionHue: 222,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 90,
            linkContrast: 60,
            linkLightnessLimit: 100,
            linkDefaultSaturation: 100,
            linkDefaultHue: 227,
            linkVisitedHue: 295,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 90,
            borderContrast: 40,
            borderLightnessLimit: 98,
            borderGraySaturation: 20,
            borderGrayHue: 196,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 90,
            imageSaturationLimit: 90,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 90,
            backgroundImageSaturationLimit: 90,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 15,
            scrollbarContrast: 5,
            scrollbarLightnessLimit: 80,
            scrollbarGrayHue: 188,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "antiqueCodex",
            colorSchemeName: "Antique Codex",
            runOnThisSite: true,
            doNotInvertContent: false,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            blueFilter: 5,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 30,
            backgroundContrast: 50,
            backgroundLightnessLimit: 93,
            backgroundGraySaturation: 50,
            backgroundGrayHue: 45,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 40,
            buttonContrast: 10,
            buttonLightnessLimit: 85,
            buttonGraySaturation: 50,
            buttonGrayHue: 38,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 90,
            textContrast: 80,
            textLightnessLimit: 100,
            textGraySaturation: 40,
            textGrayHue: 16,
            textSelectionHue: 20,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 90,
            linkContrast: 65,
            linkLightnessLimit: 100,
            linkDefaultSaturation: 100,
            linkDefaultHue: 32,
            linkVisitedHue: 15,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 80,
            borderContrast: 60,
            borderLightnessLimit: 100,
            borderGraySaturation: 40,
            borderGrayHue: 34,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 93,
            imageSaturationLimit: 50,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 93,
            backgroundImageSaturationLimit: 30,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 15,
            scrollbarContrast: 5,
            scrollbarLightnessLimit: 85,
            scrollbarGrayHue: 20,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "blueLightFilter",
            colorSchemeName: "Blue Light Filter",
            runOnThisSite: true,
            doNotInvertContent: false,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            blueFilter: 32,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 90,
            backgroundContrast: 50,
            backgroundLightnessLimit: 98,
            backgroundGraySaturation: 30,
            backgroundGrayHue: 40,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 20,
            buttonSaturationLimit: 100,
            buttonContrast: 10,
            buttonLightnessLimit: 85,
            buttonGraySaturation: 30,
            buttonGrayHue: 36,
            buttonReplaceAllHues: false,
            buttonHueGravity: 10,
            textSaturationLimit: 90,
            textContrast: 70,
            textLightnessLimit: 100,
            textGraySaturation: 20,
            textGrayHue: 16,
            textSelectionHue: 324,
            textReplaceAllHues: false,
            textHueGravity: 20,
            linkSaturationLimit: 90,
            linkContrast: 70,
            linkLightnessLimit: 100,
            linkDefaultSaturation: 100,
            linkDefaultHue: 300,
            linkVisitedHue: 13,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 80,
            borderContrast: 50,
            borderLightnessLimit: 100,
            borderGraySaturation: 20,
            borderGrayHue: 24,
            borderReplaceAllHues: false,
            borderHueGravity: 30,
            imageLightnessLimit: 100,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 100,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 20,
            scrollbarContrast: 5,
            scrollbarLightnessLimit: 95,
            scrollbarGrayHue: 115,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "increasedContrast",
            colorSchemeName: "Increased Contrast",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 100,
            backgroundContrast: 50,
            backgroundLightnessLimit: 100,
            backgroundGraySaturation: 0,
            backgroundGrayHue: 240,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 100,
            buttonContrast: 10,
            buttonLightnessLimit: 90,
            buttonGraySaturation: 0,
            buttonGrayHue: 240,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 100,
            textContrast: 70,
            textLightnessLimit: 100,
            textGraySaturation: 40,
            textGrayHue: 16,
            textSelectionHue: 231,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 100,
            linkContrast: 65,
            linkLightnessLimit: 100,
            linkDefaultSaturation: 100,
            linkDefaultHue: 231,
            linkVisitedHue: 291,
            linkReplaceAllHues: false,
            linkHueGravity: 50,
            borderSaturationLimit: 100,
            borderContrast: 55,
            borderLightnessLimit: 100,
            borderGraySaturation: 10,
            borderGrayHue: 16,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 100,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 100,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 0,
            scrollbarContrast: 5,
            scrollbarLightnessLimit: 90,
            scrollbarGrayHue: 240,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "grayscale",
            colorSchemeName: "Grayscale",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 10,
            backgroundContrast: 50,
            backgroundLightnessLimit: 100,
            backgroundGraySaturation: 0,
            backgroundGrayHue: 240,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 20,
            buttonContrast: 5,
            buttonLightnessLimit: 95,
            buttonGraySaturation: 0,
            buttonGrayHue: 240,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 10,
            textContrast: 60,
            textLightnessLimit: 100,
            textGraySaturation: 0,
            textGrayHue: 240,
            textSelectionHue: 231,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 25,
            linkContrast: 60,
            linkLightnessLimit: 100,
            linkDefaultSaturation: 25,
            linkDefaultHue: 231,
            linkVisitedHue: 291,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 10,
            borderContrast: 40,
            borderLightnessLimit: 100,
            borderGraySaturation: 0,
            borderGrayHue: 240,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 100,
            imageSaturationLimit: 10,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 100,
            backgroundImageSaturationLimit: 10,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 0,
            scrollbarContrast: 5,
            scrollbarLightnessLimit: 80,
            scrollbarGrayHue: 240,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "invertedLight",
            colorSchemeName: "Inverted Light",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 80,
            backgroundContrast: 50,
            backgroundLightnessLimit: 10,
            backgroundGraySaturation: 0,
            backgroundGrayHue: 190,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 80,
            buttonContrast: 4,
            buttonLightnessLimit: 15,
            buttonGraySaturation: 0,
            buttonGrayHue: 190,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 90,
            textContrast: 75,
            textLightnessLimit: 95,
            textGraySaturation: 0,
            textGrayHue: 190,
            textSelectionHue: 207,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 80,
            linkContrast: 65,
            linkLightnessLimit: 85,
            linkDefaultSaturation: 80,
            linkDefaultHue: 231,
            linkVisitedHue: 291,
            linkReplaceAllHues: false,
            linkHueGravity: 50,
            borderSaturationLimit: 80,
            borderContrast: 30,
            borderLightnessLimit: 70,
            borderGraySaturation: 0,
            borderGrayHue: 190,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 75,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 0,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 40,
            scrollbarGrayHue: 190,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "invertedGrayscale",
            colorSchemeName: "Inverted Grayscale",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 10,
            backgroundContrast: 50,
            backgroundLightnessLimit: 10,
            backgroundGraySaturation: 0,
            backgroundGrayHue: 190,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 20,
            buttonContrast: 2,
            buttonLightnessLimit: 7,
            buttonGraySaturation: 0,
            buttonGrayHue: 190,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 10,
            textContrast: 75,
            textLightnessLimit: 95,
            textGraySaturation: 0,
            textGrayHue: 190,
            textSelectionHue: 231,
            textReplaceAllHues: false,
            textHueGravity: 0,
            linkSaturationLimit: 20,
            linkContrast: 70,
            linkLightnessLimit: 85,
            linkDefaultSaturation: 25,
            linkDefaultHue: 231,
            linkVisitedHue: 291,
            linkReplaceAllHues: false,
            linkHueGravity: 80,
            borderSaturationLimit: 10,
            borderContrast: 30,
            borderLightnessLimit: 50,
            borderGraySaturation: 0,
            borderGrayHue: 190,
            borderReplaceAllHues: false,
            borderHueGravity: 0,
            imageLightnessLimit: 75,
            imageSaturationLimit: 10,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 30,
            backgroundImageSaturationLimit: 10,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 0,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 40,
            scrollbarGrayHue: 190,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "yellowOnBlack",
            colorSchemeName: "Yellow on Black",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 80,
            backgroundContrast: 50,
            backgroundLightnessLimit: 10,
            backgroundGraySaturation: 0,
            backgroundGrayHue: 55,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 80,
            buttonContrast: 3,
            buttonLightnessLimit: 12,
            buttonGraySaturation: 0,
            buttonGrayHue: 55,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 60,
            textContrast: 60,
            textLightnessLimit: 90,
            textGraySaturation: 80,
            textGrayHue: 54,
            textSelectionHue: 231,
            textReplaceAllHues: false,
            textHueGravity: 60,
            linkSaturationLimit: 80,
            linkContrast: 55,
            linkLightnessLimit: 80,
            linkDefaultSaturation: 90,
            linkDefaultHue: 60,
            linkVisitedHue: 40,
            linkReplaceAllHues: false,
            linkHueGravity: 60,
            borderSaturationLimit: 60,
            borderContrast: 40,
            borderLightnessLimit: 70,
            borderGraySaturation: 50,
            borderGrayHue: 54,
            borderReplaceAllHues: false,
            borderHueGravity: 80,
            imageLightnessLimit: 75,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 40,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 50,
            scrollbarGrayHue: 54,
            scrollbarSize: 10,
            scrollbarStyle: true
        },
        {
            colorSchemeId: "greenOnBlack",
            colorSchemeName: "Green on Black",
            runOnThisSite: true,
            restoreColorsOnCopy: false,
            restoreColorsOnPrint: true,
            doNotInvertContent: false,
            blueFilter: 0,
            mode: ProcessingMode.Automatic,
            modeAutoSwitchLimit: 5000,
            useDefaultSchedule: true,
            scheduleStartHour: 0,
            scheduleFinishHour: 24,
            includeMatches: "",
            excludeMatches: "",
            backgroundSaturationLimit: 80,
            backgroundContrast: 50,
            backgroundLightnessLimit: 10,
            backgroundGraySaturation: 0,
            backgroundGrayHue: 125,
            backgroundReplaceAllHues: false,
            backgroundHueGravity: 0,
            buttonSaturationLimit: 80,
            buttonContrast: 3,
            buttonLightnessLimit: 12,
            buttonGraySaturation: 0,
            buttonGrayHue: 125,
            buttonReplaceAllHues: false,
            buttonHueGravity: 0,
            textSaturationLimit: 60,
            textContrast: 60,
            textLightnessLimit: 90,
            textGraySaturation: 80,
            textGrayHue: 122,
            textSelectionHue: 231,
            textReplaceAllHues: false,
            textHueGravity: 60,
            linkSaturationLimit: 80,
            linkContrast: 55,
            linkLightnessLimit: 80,
            linkDefaultSaturation: 90,
            linkDefaultHue: 88,
            linkVisitedHue: 42,
            linkReplaceAllHues: false,
            linkHueGravity: 60,
            borderSaturationLimit: 60,
            borderContrast: 40,
            borderLightnessLimit: 70,
            borderGraySaturation: 50,
            borderGrayHue: 122,
            borderReplaceAllHues: false,
            borderHueGravity: 80,
            imageLightnessLimit: 75,
            imageSaturationLimit: 100,
            useImageHoverAnimation: false,
            backgroundImageLightnessLimit: 40,
            backgroundImageSaturationLimit: 100,
            hideBigBackgroundImages: true,
            maxBackgroundImageSize: 500,
            scrollbarSaturationLimit: 40,
            scrollbarContrast: 0,
            scrollbarLightnessLimit: 50,
            scrollbarGrayHue: 122,
            scrollbarSize: 10,
            scrollbarStyle: true
        }
    ]
};

;// CONCATENATED MODULE: ./ts/Utils/TypeGuards.ts
const BOOL = Boolean.name.toLowerCase();
const NUM = Number.name.toLowerCase();
const STR = String.name.toLowerCase();
function isNum(arg) {
    return typeof arg === NUM;
}
function isStr(arg) {
    return typeof arg === STR;
}
function isBool(arg) {
    return typeof arg === BOOL;
}

;// CONCATENATED MODULE: ./ts/Settings/BaseSettingsManager.ts






const BaseSettingsManager_ArgEventDispatcher = ArgumentedEventDispatcher;
class IBaseSettingsManager {
}
class BaseSettingsManager {
    constructor(_rootDocument, _app, _storageManager, _settingsBus, _matchPatternProcessor, _i18n, _recommendations) {
        this._rootDocument = _rootDocument;
        this._app = _app;
        this._storageManager = _storageManager;
        this._settingsBus = _settingsBus;
        this._matchPatternProcessor = _matchPatternProcessor;
        this._i18n = _i18n;
        this._recommendations = _recommendations;
        this._scheduleStartTime = 0;
        this._scheduleFinishTime = 24;
        this._curTime = this.GetCurrentTime();
        this._isNotRecommended = false;
        this._curSystemSchemeIsDark = this.HasDarkSystemColorSchemePreference();
        this._computedMode = ProcessingMode.Complex;
        this.isInit = false;
        this._onSettingsInitialized = new BaseSettingsManager_ArgEventDispatcher();
        this._onSettingsChanged = new ResponsiveEventDispatcher();
        let hostName;
        try {
            hostName = window.top.location.hostname;
            this._rootUrl = window.top.location.href;
        }
        catch (_a) {
            hostName = _rootDocument.location.hostname;
            this._rootUrl = _rootDocument.location.href;
        }
        this._settingsKey = `ws:${hostName}`;
        this.onSettingsInitialized.addListener(shift => this.isInit = true, this);
        this.initDefaultColorSchemes();
        this._defaultSettings = Object.assign(Object.assign({}, ColorSchemes.default), ColorSchemes.dimmedDust);
        this.renameSettingsToDefault(this._defaultSettings);
        this._currentSettings = Object.assign({}, this._defaultSettings);
        this.initCurrentSettings();
    }
    get isScheduled() {
        if (this.UseSystemDarkSchedule)
            return this._curSystemSchemeIsDark;
        return this._scheduleStartTime <= this._scheduleFinishTime
            ? this._scheduleStartTime <= this._curTime && this._curTime < this._scheduleFinishTime
            : this._scheduleStartTime <= this._curTime || this._curTime < this._scheduleFinishTime;
    }
    get UseSystemDarkSchedule() {
        return this._currentSettings.useDefaultSchedule === SystemSchedule.Dark ||
            this._currentSettings.useDefaultSchedule && this._defaultSettings.useDefaultSchedule === SystemSchedule.Dark;
    }
    get matchesInclude() {
        if (this._lastIncludeMatchPatternsTestResults === undefined) {
            this._lastIncludeMatchPatternsTestResults =
                this.testMatchPatterns(this._currentSettings.includeMatches, true);
        }
        return this._lastIncludeMatchPatternsTestResults;
    }
    get matchesExclude() {
        if (this._lastExcludeMatchPatternsTestResults === undefined) {
            this._lastExcludeMatchPatternsTestResults =
                this.testMatchPatterns(this._currentSettings.excludeMatches, false);
        }
        return this._lastExcludeMatchPatternsTestResults;
    }
    get currentSettings() { return this._currentSettings; }
    get shift() { return this._shift; }
    get isActive() {
        return !this._isNotRecommended && this.isInit &&
            this._currentSettings.isEnabled &&
            this.isScheduled && (this._currentSettings.runOnThisSite && !this.matchesExclude
            ||
                !this._currentSettings.runOnThisSite && this.matchesInclude && !this.matchesExclude);
    }
    get isComplex() { return this._computedMode === ProcessingMode.Complex; }
    get isSimple() { return this._computedMode === ProcessingMode.Simplified; }
    get isFilter() { return this._computedMode === ProcessingMode.Filter; }
    get computedMode() { return this._computedMode; }
    get defaultColorSchemeId() { return this._defaultColorSchemeId; }
    ;
    shouldObserve() {
        return this._recommendations.shouldObserve(this._rootDocument.location.href, this._rootUrl);
    }
    computeProcessingMode(doc, countElements = true) {
        this._isNotRecommended = false;
        if (this._currentSettings.mode === ProcessingMode.Filter) {
            this._computedMode = ProcessingMode.Filter;
        }
        else if (this._currentSettings.mode === ProcessingMode.Automatic) {
            let recommendedMode = this._recommendations
                .getRecommendedProcessingMode(this._rootDocument.location.href, this._rootUrl);
            if (recommendedMode !== undefined) {
                if (recommendedMode) {
                    this._computedMode = recommendedMode;
                }
                else {
                    this._isNotRecommended = true;
                }
            }
            else if (this._app.isMobile || countElements && doc.body &&
                doc.body.getElementsByTagName("*").length > this._currentSettings.modeAutoSwitchLimit) {
                this._computedMode = ProcessingMode.Simplified;
            }
        }
        this._app.isDebug && console.log(`
            ${this._computedMode}: ${doc.body && doc.body.getElementsByTagName("*").length}
            mode: ${this.currentSettings.mode}
            self: ${this._rootDocument.location.href}
            top: ${this._rootUrl}`);
    }
    deactivateOldVersion() {
        this.isInit = false;
    }
    initCurSet() {
        this._lastIncludeMatchPatternsTestResults =
            this._lastExcludeMatchPatternsTestResults = undefined;
        this.applyBackwardCompatibility(this._currentSettings);
        this._computedMode =
            this._currentSettings.mode === ProcessingMode.Automatic
                ? ProcessingMode.Complex
                : this._currentSettings.mode;
        const set = Object.assign({}, this._currentSettings);
        for (const setting in set) {
            if (setting in ColorSchemes.dimmedDust) {
                const prop = setting;
                const val = set[prop];
                if (!/Hue$/g.test(prop) && isNum(val)) {
                    set[prop] = val / 100;
                }
            }
            else {
                delete set[setting];
            }
        }
        this._shift = {
            Background: {
                saturationLimit: set.backgroundSaturationLimit,
                contrast: set.backgroundContrast,
                lightnessLimit: set.backgroundLightnessLimit,
                graySaturation: set.backgroundGraySaturation,
                grayHue: set.backgroundGrayHue,
                replaceAllHues: set.backgroundReplaceAllHues || false,
                hueGravity: set.backgroundHueGravity || 0
            },
            HighlightedBackground: {
                saturationLimit: Math.min(Number((set.backgroundSaturationLimit * 1.3).toFixed(2)), 1),
                contrast: Math.min(Number((set.buttonContrast * 1.5).toFixed(2)), 1),
                lightnessLimit: Number((set.borderLightnessLimit * 0.8).toFixed(2)),
                graySaturation: set.backgroundGraySaturation,
                grayHue: set.backgroundGrayHue,
                replaceAllHues: set.backgroundReplaceAllHues || false,
                hueGravity: set.backgroundHueGravity || 0
            },
            ButtonBackground: {
                saturationLimit: set.buttonSaturationLimit,
                contrast: set.buttonContrast,
                lightnessLimit: set.buttonLightnessLimit,
                graySaturation: set.buttonGraySaturation,
                grayHue: set.buttonGrayHue,
                replaceAllHues: set.buttonReplaceAllHues || false,
                hueGravity: set.buttonHueGravity || 0
            },
            TextSelection: {
                saturationLimit: Math.max(set.textSaturationLimit, 0.3),
                contrast: 0,
                lightnessLimit: 0.46,
                graySaturation: Math.max(set.textSaturationLimit, 0.3),
                grayHue: set.textSelectionHue,
                replaceAllHues: true,
                hueGravity: 0
            },
            Text: {
                saturationLimit: set.textSaturationLimit,
                contrast: set.textContrast,
                lightnessLimit: set.textLightnessLimit,
                graySaturation: set.textGraySaturation,
                grayHue: set.textGrayHue,
                replaceAllHues: set.textReplaceAllHues || false,
                hueGravity: set.textHueGravity || 0
            },
            HighlightedText: {
                saturationLimit: Math.min(Number((set.textSaturationLimit * 1.2).toFixed(2)), 1),
                contrast: Math.min(Number((set.textContrast * 1.2).toFixed(2)), 1),
                lightnessLimit: Math.min(Number((set.textLightnessLimit * 1.25).toFixed(2)), 1),
                graySaturation: set.textGraySaturation,
                grayHue: set.textGrayHue,
                replaceAllHues: set.textReplaceAllHues || false,
                hueGravity: set.textHueGravity || 0
            },
            Link: {
                saturationLimit: set.linkSaturationLimit,
                contrast: set.linkContrast,
                lightnessLimit: set.linkLightnessLimit,
                graySaturation: set.linkDefaultSaturation,
                grayHue: set.linkDefaultHue,
                replaceAllHues: set.linkReplaceAllHues || false,
                hueGravity: set.linkHueGravity || 0
            },
            Link$Active: {
                saturationLimit: set.linkSaturationLimit,
                contrast: set.linkContrast,
                lightnessLimit: Number((set.linkLightnessLimit * 0.9).toFixed(2)),
                graySaturation: set.linkDefaultSaturation,
                grayHue: set.linkDefaultHue,
                replaceAllHues: set.linkReplaceAllHues || false,
                hueGravity: set.linkHueGravity || 0
            },
            Link$Hover: {
                saturationLimit: set.linkSaturationLimit,
                contrast: Math.min(Number((set.linkContrast * 1.1).toFixed(2)), 1),
                lightnessLimit: Math.min(Number((set.linkLightnessLimit * 1.1).toFixed(2)), 1),
                graySaturation: set.linkDefaultSaturation,
                grayHue: set.linkDefaultHue,
                replaceAllHues: set.linkReplaceAllHues || false,
                hueGravity: set.linkHueGravity || 0
            },
            VisitedLink: {
                saturationLimit: set.linkSaturationLimit,
                contrast: set.linkContrast,
                lightnessLimit: set.linkLightnessLimit,
                graySaturation: set.linkDefaultSaturation,
                grayHue: set.linkVisitedHue,
                replaceAllHues: true,
                hueGravity: 0
            },
            VisitedLink$Hover: {
                saturationLimit: set.linkSaturationLimit,
                contrast: Math.min(Number((set.linkContrast * 1.1).toFixed(2)), 1),
                lightnessLimit: Math.min(Number((set.linkLightnessLimit * 1.1).toFixed(2)), 1),
                graySaturation: set.linkDefaultSaturation,
                grayHue: set.linkVisitedHue,
                replaceAllHues: true,
                hueGravity: 0
            },
            VisitedLink$Active: {
                saturationLimit: set.linkSaturationLimit,
                contrast: set.linkContrast,
                lightnessLimit: Number((set.linkLightnessLimit * 0.9).toFixed(2)),
                graySaturation: set.linkDefaultSaturation,
                grayHue: set.linkVisitedHue,
                replaceAllHues: true,
                hueGravity: 0
            },
            TextShadow: {
                saturationLimit: set.borderSaturationLimit,
                contrast: 0.8,
                lightnessLimit: 1,
                graySaturation: set.borderGraySaturation,
                grayHue: set.borderGrayHue,
                replaceAllHues: set.borderReplaceAllHues || false,
                hueGravity: set.borderHueGravity || 0
            },
            Border: {
                saturationLimit: set.borderSaturationLimit,
                contrast: set.borderContrast,
                lightnessLimit: set.borderLightnessLimit,
                graySaturation: set.borderGraySaturation,
                grayHue: set.borderGrayHue,
                replaceAllHues: set.borderReplaceAllHues || false,
                hueGravity: set.borderHueGravity || 0
            },
            ButtonBorder: {
                saturationLimit: Number((set.borderSaturationLimit * 0.8).toFixed(2)),
                contrast: Number((set.borderContrast * 0.5).toFixed(2)),
                lightnessLimit: Number((set.borderLightnessLimit * 0.8).toFixed(2)),
                graySaturation: set.borderGraySaturation,
                grayHue: set.borderGrayHue,
                replaceAllHues: set.borderReplaceAllHues || false,
                hueGravity: set.borderHueGravity || 0
            },
            Scrollbar$Hover: {
                saturationLimit: set.scrollbarSaturationLimit,
                contrast: set.scrollbarContrast,
                lightnessLimit: set.scrollbarLightnessLimit,
                graySaturation: set.scrollbarSaturationLimit,
                grayHue: set.scrollbarGrayHue,
                replaceAllHues: false,
                hueGravity: 0
            },
            Scrollbar$Normal: {
                saturationLimit: set.scrollbarSaturationLimit,
                contrast: set.scrollbarContrast,
                lightnessLimit: Number((set.scrollbarLightnessLimit * 0.8).toFixed(2)),
                graySaturation: set.scrollbarSaturationLimit,
                grayHue: set.scrollbarGrayHue,
                replaceAllHues: false,
                hueGravity: 0
            },
            Scrollbar$Active: {
                saturationLimit: set.scrollbarSaturationLimit,
                contrast: set.scrollbarContrast,
                lightnessLimit: Number((set.scrollbarLightnessLimit * 0.7).toFixed(2)),
                graySaturation: set.scrollbarSaturationLimit,
                grayHue: set.scrollbarGrayHue,
                replaceAllHues: false,
                hueGravity: 0
            },
            Image: {
                saturationLimit: set.imageSaturationLimit,
                contrast: set.textContrast,
                lightnessLimit: set.imageLightnessLimit,
                graySaturation: set.textGraySaturation,
                grayHue: set.textGrayHue,
                replaceAllHues: false,
                hueGravity: 0
            },
            SvgBackground: {
                saturationLimit: set.buttonSaturationLimit,
                contrast: set.backgroundContrast,
                lightnessLimit: set.borderLightnessLimit,
                graySaturation: set.buttonGraySaturation,
                grayHue: set.buttonGrayHue,
                replaceAllHues: false,
                hueGravity: set.buttonHueGravity || 0
            },
            BackgroundImage: {
                saturationLimit: set.backgroundImageSaturationLimit,
                contrast: set.backgroundContrast,
                lightnessLimit: set.backgroundImageLightnessLimit,
                graySaturation: set.backgroundGraySaturation,
                grayHue: set.backgroundGrayHue,
                replaceAllHues: false,
                hueGravity: 0
            },
            Video: {
                saturationLimit: 1,
                contrast: 0.5,
                lightnessLimit: 1,
                graySaturation: 0,
                grayHue: 0,
                replaceAllHues: false,
                hueGravity: 0
            }
        };
    }
    applyBackwardCompatibility(settings) {
        if (settings.hideBigBackgroundImages === undefined) {
            settings.hideBigBackgroundImages = true;
        }
        if (settings.maxBackgroundImageSize === undefined ||
            isNaN(settings.maxBackgroundImageSize)) {
            settings.maxBackgroundImageSize = 500;
        }
        if (!settings.mode) {
            settings.mode = ProcessingMode.Complex;
        }
        if (settings.scrollbarStyle === undefined) {
            settings.scrollbarStyle = true;
        }
        if (settings.modeAutoSwitchLimit === undefined ||
            isNaN(settings.modeAutoSwitchLimit)) {
            settings.modeAutoSwitchLimit = 5000;
        }
        if (settings.doNotInvertContent === undefined) {
            settings.doNotInvertContent = false;
        }
        if (settings.includeMatches === undefined) {
            settings.includeMatches = "";
        }
        if (settings.excludeMatches === undefined) {
            settings.excludeMatches = "";
        }
        if (settings.buttonSaturationLimit === undefined ||
            isNaN(settings.buttonSaturationLimit)) {
            settings.buttonSaturationLimit = Math.min(Math.round(settings.backgroundSaturationLimit * 1.1), 100);
        }
        if (settings.buttonContrast === undefined ||
            isNaN(settings.buttonContrast)) {
            settings.buttonContrast = Math.round(settings.borderContrast / 3);
        }
        if (settings.buttonLightnessLimit === undefined ||
            isNaN(settings.buttonLightnessLimit)) {
            settings.buttonLightnessLimit = Math.round(settings.backgroundLightnessLimit * 0.8);
        }
        if (settings.buttonGraySaturation === undefined ||
            isNaN(settings.buttonGraySaturation)) {
            settings.buttonGraySaturation = Math.min(Math.round(settings.backgroundGraySaturation * 1.1), 100);
        }
        if (settings.buttonGrayHue === undefined) {
            settings.buttonGrayHue =
                settings.backgroundGrayHue;
        }
        settings.buttonReplaceAllHues =
            settings.buttonReplaceAllHues || false;
        settings.backgroundHueGravity = settings.backgroundHueGravity || 0;
        settings.buttonHueGravity = settings.buttonHueGravity || 0;
        settings.borderHueGravity = settings.borderHueGravity || 0;
        settings.textHueGravity = settings.textHueGravity || 0;
        settings.linkHueGravity = settings.linkHueGravity || 0;
    }
    updateSchedule() {
        if (this.UseSystemDarkSchedule) {
            this._curSystemSchemeIsDark = this.HasDarkSystemColorSchemePreference();
        }
        else {
            this._curTime = this.GetCurrentTime();
            if (this._currentSettings.useDefaultSchedule) {
                this._scheduleStartTime = this._defaultSettings.scheduleStartHour !== undefined ? this._defaultSettings.scheduleStartHour : 0;
                this._scheduleFinishTime = this._defaultSettings.scheduleFinishHour !== undefined ? this._defaultSettings.scheduleFinishHour : 24;
            }
            else {
                this._scheduleStartTime = this._currentSettings.scheduleStartHour !== undefined ? this._currentSettings.scheduleStartHour : 0;
                this._scheduleFinishTime = this._currentSettings.scheduleFinishHour !== undefined ? this._currentSettings.scheduleFinishHour : 24;
            }
        }
    }
    GetCurrentTime() {
        let now = new Date();
        return now.getHours() + now.getMinutes() / 60;
    }
    HasDarkSystemColorSchemePreference() {
        return this.PrefersDarkColorSchemeMediaMatch().matches;
    }
    PrefersDarkColorSchemeMediaMatch() {
        return window.matchMedia("(prefers-color-scheme: dark)");
    }
    notifySettingsApplied() {
        this._settingsBus.notifySettingsApplied(this._currentSettings)
            .catch(ex => this._app.isDebug &&
            console.error((`Error in ${window.top === window.self ? "top" : "child"} frame:\n${ex.message || ex}`)));
    }
    get onSettingsInitialized() {
        return this._onSettingsInitialized.event;
    }
    get onSettingsChanged() {
        return this._onSettingsChanged.event;
    }
    initDefaultColorSchemes() {
        let setting;
        for (setting in ColorSchemes) {
            delete ColorSchemes[setting];
        }
        this.applyUserColorSchemesFromMemory(DefaultColorSchemes);
    }
    getDefaultSettings(renameToDefault = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const defaultSettings = yield this._storageManager.get(Object.assign(Object.assign({}, ColorSchemes.default), ColorSchemes.dimmedDust));
            yield this.processDefaultSettings(defaultSettings, renameToDefault);
            return this._defaultSettings;
        });
    }
    processDefaultSettings(defaultSettings, renameToDefault) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.applyUserColorSchemesFromStorage(defaultSettings);
            this.assignSettings(this._defaultSettings, defaultSettings);
            Object.assign(this._defaultSettings, {
                changeBrowserTheme: defaultSettings.changeBrowserTheme,
                userColorSchemeIds: defaultSettings.userColorSchemeIds,
                restoreColorsOnCopy: defaultSettings.restoreColorsOnCopy,
                restoreColorsOnPrint: defaultSettings.restoreColorsOnPrint,
            });
            this._defaultColorSchemeId = this._defaultSettings.colorSchemeId;
            if (renameToDefault) {
                this.renameSettingsToDefault(this._defaultSettings);
            }
        });
    }
    renameSettingsToDefault(settings) {
        settings.colorSchemeId = "default";
        this.localizeColorScheme(settings);
    }
    localizeColorScheme(settings) {
        if (settings.colorSchemeName.startsWith(ColorSchemeNamePrefix.FromFile) ||
            settings.colorSchemeName.startsWith(ColorSchemeNamePrefix.Public)) {
            return;
        }
        settings.colorSchemeName =
            this._i18n.getMessage(`colorSchemeName_${settings.colorSchemeId}`) ||
                settings.colorSchemeName;
    }
    applyUserColorSchemesFromMemory(defaultSettings) {
        if (defaultSettings.userColorSchemes && defaultSettings.userColorSchemes.length > 0) {
            for (const userColorScheme of defaultSettings.userColorSchemes) {
                this.localizeColorScheme(userColorScheme);
                this.applyBackwardCompatibility(userColorScheme);
                ColorSchemes[userColorScheme.colorSchemeId] =
                    Object.assign(ColorSchemes[userColorScheme.colorSchemeId] || {}, userColorScheme);
            }
        }
        Object.assign(ColorSchemes.default, defaultSettings.colorSchemeId ? defaultSettings : ColorSchemes.dimmedDust);
        this.renameSettingsToDefault(ColorSchemes.default);
    }
    applyUserColorSchemesFromStorage(defaultSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (defaultSettings.userColorSchemeIds && defaultSettings.userColorSchemeIds.length > 0) {
                const userColorSchemeIds = defaultSettings.userColorSchemeIds.reduce((all, id) => {
                    all[`cs:${id}`] = { colorSchemeId: "none" };
                    return all;
                }, {});
                const userColorSchemesStore = Object.values(yield this._storageManager.get(userColorSchemeIds))
                    .sort((a, b) => a.colorSchemeName ? a.colorSchemeName.localeCompare(b.colorSchemeName) : 0);
                for (const key in userColorSchemesStore) {
                    const userColorScheme = userColorSchemesStore[key];
                    if (userColorScheme && userColorScheme.colorSchemeId !== "none") {
                        this.applyBackwardCompatibility(userColorScheme);
                        ColorSchemes[userColorScheme.colorSchemeId] =
                            Object.assign(ColorSchemes[userColorScheme.colorSchemeId] || {}, userColorScheme);
                    }
                }
            }
            Object.assign(ColorSchemes.default, defaultSettings.colorSchemeId ? defaultSettings : ColorSchemes.dimmedDust);
            this.renameSettingsToDefault(ColorSchemes.default);
        });
    }
    saveUserColorScheme(userColorScheme) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield this._storageManager
                .get({
                userColorSchemes: [],
                userColorSchemeIds: []
            });
            if (storage.userColorSchemes && storage.userColorSchemes.length > 0) {
                for (const oldUserColorScheme of storage.userColorSchemes) {
                    this.putUserColorSchemeIntoStorage(storage, oldUserColorScheme);
                }
                delete storage.userColorSchemes;
                yield this._storageManager.remove('userColorSchemes');
            }
            this.putUserColorSchemeIntoStorage(storage, userColorScheme);
            return this._storageManager.set(storage);
        });
    }
    putUserColorSchemeIntoStorage(storage, userColorScheme) {
        if (!storage.userColorSchemeIds
            .find(id => id === userColorScheme.colorSchemeId)) {
            storage.userColorSchemeIds.push(userColorScheme.colorSchemeId);
        }
        storage[`cs:${userColorScheme.colorSchemeId}`] = userColorScheme;
    }
    deleteUserColorScheme(colorSchemeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = yield this._storageManager
                .get({
                userColorSchemes: [],
                userColorSchemeIds: []
            });
            if (storage.userColorSchemes && storage.userColorSchemes.length > 0) {
                let existingSchemeIndex = storage.userColorSchemes
                    .findIndex(sch => sch.colorSchemeId === colorSchemeId);
                if (existingSchemeIndex > -1) {
                    storage.userColorSchemes.splice(existingSchemeIndex, 1);
                }
            }
            else {
                delete storage.userColorSchemes;
            }
            if (storage.userColorSchemeIds && storage.userColorSchemeIds.length > 0) {
                let existingSchemeIdIndex = storage.userColorSchemeIds
                    .findIndex(id => id === colorSchemeId);
                if (existingSchemeIdIndex > -1) {
                    storage.userColorSchemeIds.splice(existingSchemeIdIndex, 1);
                }
            }
            yield this._storageManager.remove(`cs:${colorSchemeId}`);
            return yield this._storageManager.set(storage);
        });
    }
    assignSettings(to, settings) {
        if (settings.colorSchemeId && settings.colorSchemeId !== CustomColorSchemeId &&
            ColorSchemes[settings.colorSchemeId]) {
            Object.assign(to, ColorSchemes[settings.colorSchemeId]);
            if (settings.runOnThisSite !== undefined) {
                to.runOnThisSite = settings.runOnThisSite;
            }
            if (settings.isEnabled !== undefined) {
                to.isEnabled = settings.isEnabled;
            }
        }
        else {
            Object.assign(to, settings);
        }
    }
    settingsAreEqual(first, second, excludeRunOnThisSiteFromCompare = false) {
        for (let setting in first) {
            let prop = setting;
            if (excludeSettingsForCompare.indexOf(prop) == -1 &&
                !(excludeRunOnThisSiteFromCompare && prop === "runOnThisSite")) {
                if (first[prop] !== second[prop]) {
                    return false;
                }
            }
        }
        return true;
    }
    testMatchPatterns(matchPatterns, invalidResult) {
        if (matchPatterns) {
            for (const pattern of matchPatterns.split("\n")) {
                if (pattern && this._matchPatternProcessor.testUrl(pattern, this._rootUrl, invalidResult)) {
                    return true;
                }
            }
        }
        return false;
    }
    getErrorReason(error) {
        return __awaiter(this, void 0, void 0, function* () {
            var result = (typeof error === 'string' ? error : error.message) || '';
            const storage = yield this._storageManager.getCurrentStorage();
            let limit;
            for (limit in StorageLimits) {
                if (new RegExp(`\\b${limit}\\b`, 'gi').test(result)) {
                    result = this._i18n.getMessage(`${storage}Storage_${limit}_ErrorMessage`, this._app.getStorageLimits(storage, limit).toString())
                        || result;
                    break;
                }
            }
            return result;
        });
    }
}

;// CONCATENATED MODULE: ./ts/Settings/MatchPatternProcessor.ts



const schemeSegment = "(\\*|http|https|file|ftp)";
const hostSegment = "(\\*|(?:\\*\\.)?(?:[^/*]+))?";
const pathSegment = "(.*)";
const matchPatternRegExp = new RegExp(`^${schemeSegment}://${hostSegment}/${pathSegment}$`, "i");
class IMatchPatternProcessor {
}
let MatchPatternProcessor = class MatchPatternProcessor {
    constructor(_i18n) {
        this._i18n = _i18n;
    }
    validatePattern(pattern) {
        if (pattern === '' || pattern === "*" || pattern === "<all_urls>") {
            return "";
        }
        const match = matchPatternRegExp.exec(pattern);
        if (!match) {
            return this._i18n.getMessage("invalidMatchPattern", pattern);
        }
        const [, scheme, host, path] = match;
        if (scheme !== "file" && !host) {
            return this._i18n.getMessage("invalidMatchPatternHost", pattern);
        }
        return "";
    }
    testUrl(pattern, url, invalidResult) {
        if (this.validatePattern(pattern) === "") {
            const regexp = this.convertMatchPatternToRegExp(pattern);
            return regexp.test(url);
        }
        return invalidResult;
    }
    convertMatchPatternToRegExp(pattern) {
        const match = matchPatternRegExp.exec(pattern);
        if (match) {
            let [, scheme, host, path] = match;
            let regex = '^';
            if (scheme === '*') {
                regex += '(http|https|file|ftp)';
            }
            else {
                regex += scheme;
            }
            regex += '://';
            if (host && host === '*') {
                regex += '[^/]*?';
            }
            else if (host) {
                if (host.match(/^\*\./)) {
                    regex += '[^/]*?';
                    host = host.substring(2);
                }
                regex += host.replace(/[\[\](){}?+\^\$\\\.|\-]/g, "\\$&");
            }
            if (path) {
                if (path === '*') {
                    regex += '(/.*)?';
                }
                else if (path.charAt(0) !== '/') {
                    regex += '/';
                    regex += path
                        .replace(/[\[\](){}?+\^\$\\\.|\-]/g, "\\$&")
                        .replace(/\*/g, '.*?');
                    regex += '/?';
                }
            }
            else {
                regex += '/?';
            }
            regex += '$';
            return new RegExp(regex, "i");
        }
        return /.*/;
    }
};
MatchPatternProcessor = __decorate([
    injectable(IMatchPatternProcessor),
    __metadata("design:paramtypes", [ITranslationAccessor])
], MatchPatternProcessor);

;// CONCATENATED MODULE: ./ts/Settings/Recommendations.ts




const chrom = [BrowserName.Chrome];
const firfx = [BrowserName.Firefox];
const allbr = [BrowserName.Chrome, BrowserName.Firefox];
const filter = ProcessingMode.Filter;
const simple = ProcessingMode.Simplified;
const complx = ProcessingMode.Complex;
const _none_ = null;
const allpf = [1, 0];
class IRecommendations {
}
let Recommendations = class Recommendations {
    constructor(app) {
        this.cache = new Map();
        this.recommendations = [
            { browsers: allbr, platforms: allpf, mode: _none_, observe: false, matchPattern: /^https:\/\/(www\.)?yandex\.ru\/\?stream_channel.*$/i },
            { browsers: allbr, platforms: allpf, mode: _none_, observe: false, matchPattern: /^https:\/\/(www\.)?yastatic\.net\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: _none_, observe: false, matchPattern: /^https:\/\/(www\.)?twitch\.tv\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: _none_, observe: false, matchPattern: /^https:\/\/\w+\.steampowered\.com\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: _none_, observe: false, matchPattern: /^https:\/\/steamcommunity\.com\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: complx, observe: true, matchPattern: /^https:\/\/web\.whatsapp\.com\/$/i },
            { browsers: allbr, platforms: allpf, mode: complx, observe: true, matchPattern: /^https:\/\/(www\.)?yandex\.ru\/portal\/video.*$/i },
            { browsers: allbr, platforms: allpf, mode: complx, observe: true, matchPattern: /^https:\/\/(www\.)?yandex\.ru\/images\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: simple, observe: true, matchPattern: /^https:\/\/\w+\.wikipedia\.org\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: filter, observe: false, matchPattern: /^https:\/\/(www\.)?amazon\.com\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: filter, observe: false, matchPattern: /^https:\/\/(www\.)?twitter\.com\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: filter, observe: true, matchPattern: /^https:\/\/\w+\.slack\.com\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: filter, observe: false, matchPattern: /^https:\/\/(www\.)?yandex\.ru\/.*$/i },
            { browsers: allbr, platforms: allpf, mode: filter, observe: true, matchPattern: /^https?:\/\/(\w+\.)*mlg\.ru\/.*$/i },
            { browsers: chrom, platforms: allpf, mode: filter, observe: false, matchPattern: /^https:\/\/(www.)?facebook.com\/.*$/i },
            { browsers: allbr, platforms: allpf, observe: false, matchPattern: /^https:\/\/(www.)?facebook.com\/.*$/i },
        ];
        const currentPlatform = app.isMobile ? 0 : 1;
        this.recommendations = this.recommendations.filter(rec => rec.browsers.includes(app.browserName) &&
            rec.platforms.includes(currentPlatform));
    }
    shouldObserve(...urls) {
        let shouldObserve = undefined;
        for (const url of new Set(urls)) {
            if (shouldObserve === undefined) {
                const recommendation = this.recommendations.find(rec => rec.matchPattern.test(url));
                if (recommendation) {
                    shouldObserve = recommendation.observe;
                }
            }
            if (shouldObserve !== undefined) {
                break;
            }
        }
        return shouldObserve === undefined ? true : shouldObserve;
    }
    getRecommendedProcessingMode(...urls) {
        let recommandedMode = undefined;
        for (const url of new Set(urls)) {
            recommandedMode = this.cache.get(url);
            if (recommandedMode === undefined) {
                const recommendation = this.recommendations.find(rec => rec.matchPattern.test(url));
                if (recommendation) {
                    recommandedMode = recommendation.mode;
                    this.cache.set(url, recommandedMode);
                }
            }
            if (recommandedMode !== undefined) {
                break;
            }
        }
        return recommandedMode;
    }
};
Recommendations = __decorate([
    injectable(IRecommendations),
    __metadata("design:paramtypes", [IApplicationSettings])
], Recommendations);

;// CONCATENATED MODULE: ./ts/Settings/Public/PublicSettingsManager.ts










class IPublicSettingsManager {
}
let PublicSettingsManager = class PublicSettingsManager extends BaseSettingsManager {
    constructor(rootDocument, app, storageManager, settingsBus, matchPatternProcessor, i18n, rec) {
        super(rootDocument, app, storageManager, settingsBus, matchPatternProcessor, i18n, rec);
        this._onPublicSchemesChanged = new ArgumentedEventDispatcher();
        this.isInit = true;
        storageManager.onStorageChanged.addListener(this.onStorageChanged, this);
    }
    get onPublicSchemesChanged() {
        return this._onPublicSchemesChanged.event;
    }
    initDefaultColorSchemes() { }
    initCurrentSettings() { }
    uninstallPublicSchemeByColorSchemeId(colorSchemeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = { publicSchemeIds: yield this.getInstalledPublicSchemeIds() };
            if (storage.publicSchemeIds.length > 0) {
                const installedPublicSchemes = Object.values(yield this.getInstalledPublicSchemes(storage));
                const publicScheme = installedPublicSchemes.find(x => x.cs.colorSchemeId === colorSchemeId);
                if (publicScheme) {
                    let existingPublicSchemeIdIndex = storage.publicSchemeIds.findIndex(id => id === publicScheme.id);
                    if (existingPublicSchemeIdIndex > -1) {
                        storage.publicSchemeIds.splice(existingPublicSchemeIdIndex, 1);
                    }
                    yield this._storageManager.set(storage);
                }
            }
        });
    }
    uninstallPublicScheme(publicSchemeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `ps:${publicSchemeId}`;
            const publicScheme = (yield this._storageManager.get({ [key]: null }))[key];
            if (publicScheme) {
                yield this.deleteUserColorScheme(publicScheme.cs.colorSchemeId);
                yield this._storageManager.remove(key);
                const storage = { publicSchemeIds: yield this.getInstalledPublicSchemeIds() };
                let existingPublicSchemeIdIndex = storage.publicSchemeIds.findIndex(id => id === publicSchemeId);
                if (existingPublicSchemeIdIndex > -1) {
                    storage.publicSchemeIds.splice(existingPublicSchemeIdIndex, 1);
                }
                yield this._storageManager.set(storage);
            }
        });
    }
    applyPublicScheme(publicSchemeId, hostName) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `ps:${publicSchemeId}`;
            const publicScheme = (yield this._storageManager.get({ [key]: null }))[key];
            if (publicScheme) {
                yield this._storageManager.set({
                    [`ws:${hostName}`]: {
                        colorSchemeId: publicScheme.cs.colorSchemeId,
                        runOnThisSite: true
                    }
                });
            }
            else {
                throw new Error("Color scheme cannot be found");
            }
        });
    }
    setPublicSchemeAsDefault(publicSchemeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `ps:${publicSchemeId}`;
            const publicScheme = (yield this._storageManager.get({ [key]: null }))[key];
            if (publicScheme) {
                yield this.getDefaultSettings(false);
                this._defaultSettings = Object.assign(this._defaultSettings, publicScheme.cs);
                yield this._storageManager.set(this._defaultSettings);
            }
            else {
                throw new Error("Color scheme cannot be found");
            }
        });
    }
    installPublicScheme(publicScheme) {
        return __awaiter(this, void 0, void 0, function* () {
            this.applyBackwardCompatibility(publicScheme.cs);
            yield this.saveUserColorScheme(publicScheme.cs);
            const storage = { publicSchemeIds: yield this.getInstalledPublicSchemeIds() };
            const existingPublicSchemes = yield this.getInstalledPublicSchemes(storage);
            const overlappingSchemes = Object.entries(existingPublicSchemes)
                .filter(([key, value]) => value.cs.colorSchemeId === publicScheme.cs.colorSchemeId);
            if (overlappingSchemes.length > 0) {
                const overlappingIds = overlappingSchemes.map(([key, value]) => value.id);
                storage.publicSchemeIds = storage.publicSchemeIds.filter(id => !overlappingIds.includes(id));
                yield this._storageManager.remove(overlappingSchemes.map(([key, _]) => key));
            }
            if (!storage.publicSchemeIds.find(id => id === publicScheme.id)) {
                storage.publicSchemeIds.push(publicScheme.id);
            }
            storage[`ps:${publicScheme.id}`] = publicScheme;
            yield this._storageManager.set(storage);
        });
    }
    getInstalledPublicColorSchemeIds() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = { publicSchemeIds: yield this.getInstalledPublicSchemeIds() };
            const existingPublicSchemes = yield this.getInstalledPublicSchemes(storage);
            return Object.values(existingPublicSchemes).map(x => x.cs.colorSchemeId);
        });
    }
    getInstalledPublicSchemes(storage) {
        return this._storageManager.get(storage.publicSchemeIds.reduce((all, id) => {
            all[`ps:${id}`] = { colorScheme: {} };
            return all;
        }, {}));
    }
    getInstalledPublicSchemeIds() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._storageManager.get({ publicSchemeIds: [] })).publicSchemeIds;
        });
    }
    onStorageChanged(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = 'publicSchemeIds';
            if (key in changes) {
                this._onPublicSchemesChanged.raise(yield this.getInstalledPublicSchemeIds());
            }
        });
    }
};
PublicSettingsManager = __decorate([
    injectable(IPublicSettingsManager),
    __metadata("design:paramtypes", [Document,
        IApplicationSettings,
        IStorageManager,
        ISettingsBus,
        IMatchPatternProcessor,
        ITranslationAccessor,
        IRecommendations])
], PublicSettingsManager);

;// CONCATENATED MODULE: ./ts/BackgroundPage/ExternalMessageProcessor.ts





class IExternalMessageProcessor {
}
let ExternalMessageProcessor = class ExternalMessageProcessor {
    constructor(messageBus, publicSettingsManager) {
        this.messageBus = messageBus;
        this.publicSettingsManager = publicSettingsManager;
        messageBus.onMessage.addListener(this.processMessage, this);
        publicSettingsManager.onPublicSchemesChanged.addListener(this.notifyAboutChanges, this);
    }
    notifyAboutChanges(publicSchemeIds) {
        if (publicSchemeIds) {
            this.messageBus.broadcastMessage(new PublicSchemesChanged(publicSchemeIds), "portal");
        }
    }
    sendInstalledPublicSchemesBackTo(port) {
        return __awaiter(this, void 0, void 0, function* () {
            this.messageBus.postMessage(port, new PublicSchemesChanged(yield this.publicSettingsManager.getInstalledPublicSchemeIds()));
        });
    }
    processMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg) {
                const { port, message } = msg;
                try {
                    switch (message.type) {
                        case MessageType.GetInstalledPublicSchemes:
                            yield this.sendInstalledPublicSchemesBackTo(port);
                            break;
                        case MessageType.InstallPublicScheme:
                            yield this.publicSettingsManager.installPublicScheme(message.publicScheme);
                            break;
                        case MessageType.UninstallPublicScheme:
                            yield this.publicSettingsManager.uninstallPublicScheme(message.publicSchemeId);
                            break;
                        case MessageType.ApplyPublicScheme:
                            yield this.publicSettingsManager.applyPublicScheme(message.publicSchemeId, message.hostName);
                            break;
                        case MessageType.SetPublicSchemeAsDefault:
                            yield this.publicSettingsManager.setPublicSchemeAsDefault(message.publicSchemeId);
                            break;
                        default:
                            break;
                    }
                }
                catch (error) {
                    this.messageBus.postMessage(port, new ErrorMessage("Midnight Lizard extension failed", {
                        message: error.message || error, stack: error.stack
                    }));
                }
            }
        });
    }
};
ExternalMessageProcessor = __decorate([
    injectable(IExternalMessageProcessor),
    __metadata("design:paramtypes", [IBackgroundMessageBus,
        IPublicSettingsManager])
], ExternalMessageProcessor);


;// CONCATENATED MODULE: ./ts/BackgroundPage/ImageFetcher.ts


const noneImageDataUrl = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiPgo8L3N2Zz4=";
class IImageFetcher {
}
let ImageFetcher = class ImageFetcher {
    constructor() { }
    fetchImage(url, maxSize) {
        const dataUrlPromise = url && url.startsWith("data:image") ? Promise.resolve(url) :
            fetch(url, { cache: "force-cache" })
                .then(resp => resp.blob())
                .then(blob => new Promise((resolve, reject) => {
                if (maxSize === -1 || blob.size < maxSize) {
                    let rdr = new FileReader();
                    rdr.onload = () => resolve(rdr.result);
                    rdr.onerror = () => reject(`Faild to load image: ${url}\n${rdr.error.message}`);
                    rdr.readAsDataURL(blob);
                }
                else {
                    resolve(noneImageDataUrl);
                }
            }));
        return dataUrlPromise.then(dataUrl => new Promise((resolve, reject) => {
            let img = new Image();
            img.onload = () => resolve({ d: dataUrl, w: img.naturalWidth, h: img.naturalHeight });
            img.onerror = (e) => reject(`Faild draw the image: ${url}\n${e}`);
            img.src = dataUrl;
        }));
    }
};
ImageFetcher = __decorate([
    injectable(IImageFetcher),
    __metadata("design:paramtypes", [])
], ImageFetcher);


;// CONCATENATED MODULE: ./ts/BackgroundPage/LocalMessageProcessor.ts





class ILocalMessageProcessor {
}
let LocalMessageProcessor = class LocalMessageProcessor {
    constructor(messageBus, fetcher) {
        this.messageBus = messageBus;
        this.fetcher = fetcher;
        messageBus.onMessage.addListener(this.processMessage, this);
    }
    processMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (msg) {
                const { port, message } = msg;
                try {
                    switch (message.type) {
                        case MessageType.FetchImage: {
                            try {
                                const image = yield this.fetcher.fetchImage(message.url, message.maxSize);
                                this.messageBus.postMessage(port, new ImageFetchCompleted(message.url, image));
                            }
                            catch (ex) {
                                this.messageBus.postMessage(port, new ImageFetchFailed(message.url, ex.message || ex));
                            }
                            break;
                        }
                        case MessageType.FetchExternalCss: {
                            try {
                                const cssText = yield fetch(message.url).then(x => x.text());
                                this.messageBus.postMessage(port, new ExternalCssFetchCompleted(message.url, cssText));
                            }
                            catch (ex) {
                                this.messageBus.postMessage(port, new ExternalCssFetchFailed(message.url, ex.message || ex));
                            }
                        }
                        default:
                            break;
                    }
                }
                catch (error) {
                    this.messageBus.postMessage(port, new ErrorMessage("Local message processing failed", {
                        message: error.message || error, stack: error.stack
                    }));
                }
            }
        });
    }
};
LocalMessageProcessor = __decorate([
    injectable(ILocalMessageProcessor),
    __metadata("design:paramtypes", [IBackgroundMessageBus,
        IImageFetcher])
], LocalMessageProcessor);


;// CONCATENATED MODULE: ./ts/BackgroundPage/BackgroundPageStarter.ts









Container.register(Document, class {
    constructor() { return document; }
});
Container.register(CurrentExtensionModule, class {
    constructor() {
        return new CurrentExtensionModule(ExtensionModule.BackgroundPage);
    }
});
class BackgroundPageStarter {
    constructor(...registerations) {
        Container.resolve(ICommandProcessor);
        Container.resolve(IZoomService);
        Container.resolve(IUninstallUrlSetter);
        Container.resolve(IThemeProcessor);
        Container.resolve(IApplicationInstaller);
        Container.resolve(IExternalMessageProcessor);
        Container.resolve(ILocalMessageProcessor);
    }
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromeZoomService.ts




let ChromeZoomService = class ChromeZoomService {
    constructor(_settingsBus) {
        this._settingsBus = _settingsBus;
        chrome.tabs.onZoomChange.addListener(this.onZoomChanged.bind(this));
    }
    onZoomChanged(e) {
        if (e.tabId) {
            this._settingsBus.setTabZoom(e.tabId, e.newZoomFactor)
                .catch(() => { });
        }
    }
};
ChromeZoomService = __decorate([
    injectable(IZoomService),
    __metadata("design:paramtypes", [ISettingsBus])
], ChromeZoomService);


;// CONCATENATED MODULE: ./ts/Chrome/ChromeUninstallUrlSetter.ts



let ChromeUninstallUrlSetter = class ChromeUninstallUrlSetter {
    constructor() {
        chrome.runtime
            .setUninstallURL("https://docs.google.com/forms/d/e/1FAIpQLScgAQrFPepzACCRtK_05Yq5nPei4j9O-5fBBCXzrtP6_h5nUA/viewform");
    }
};
ChromeUninstallUrlSetter = __decorate([
    injectable(IUninstallUrlSetter),
    __metadata("design:paramtypes", [])
], ChromeUninstallUrlSetter);


;// CONCATENATED MODULE: ./ts/Settings/DynamicSettingsManager.ts









class IDynamicSettingsManager extends IBaseSettingsManager {
}
let DynamicSettingsManager = class DynamicSettingsManager extends BaseSettingsManager {
    constructor(rootDocument, app, storageManager, settingsBus, matchPatternProcessor, i18n, rec) {
        super(rootDocument, app, storageManager, settingsBus, matchPatternProcessor, i18n, rec);
        this.isInit = true;
    }
    initCurrentSettings() { }
    changeSettings(newSettings, updateSchedule) {
        Object.assign(this._currentSettings, newSettings);
        if (updateSchedule) {
            this.updateSchedule();
        }
        this.initCurSet();
        this._onSettingsChanged.raise(x => { }, this._shift);
    }
};
DynamicSettingsManager = __decorate([
    injectable(IDynamicSettingsManager),
    __metadata("design:paramtypes", [Document,
        IApplicationSettings,
        IStorageManager,
        ISettingsBus,
        IMatchPatternProcessor,
        ITranslationAccessor,
        IRecommendations])
], DynamicSettingsManager);

;// CONCATENATED MODULE: ./ts/Colors/HslaColor.ts

const HslaColor_float = new Intl.NumberFormat('en-US', {
    useGrouping: false,
    maximumFractionDigits: 2
});
class HslaColor {
    constructor(hue, saturation, lightness, alpha) {
        this.hue = hue;
        this.saturation = saturation;
        this.lightness = lightness;
        this.alpha = alpha;
    }
    hueToRgb(t1, t2, hue) {
        if (hue < 0)
            hue += 6;
        if (hue >= 6)
            hue -= 6;
        if (hue < 1)
            return (t2 - t1) * hue + t1;
        else if (hue < 3)
            return t2;
        else if (hue < 4)
            return (t2 - t1) * (4 - hue) + t1;
        else
            return t1;
    }
    static toRgbaColor(hsla) {
        let t1, t2, r, g, b;
        let hue = hsla.hue / 60;
        if (hsla.lightness <= 0.5) {
            t2 = hsla.lightness * (hsla.saturation + 1);
        }
        else {
            t2 = hsla.lightness + hsla.saturation - (hsla.lightness * hsla.saturation);
        }
        t1 = hsla.lightness * 2 - t2;
        r = hsla.hueToRgb(t1, t2, hue + 2) * 255;
        g = hsla.hueToRgb(t1, t2, hue) * 255;
        b = hsla.hueToRgb(t1, t2, hue - 2) * 255;
        return new RgbaColor(r, g, b, hsla.alpha);
    }
    toString() {
        if (this.alpha === 1) {
            return `hsl(${Math.round(this.hue)}, ${HslaColor_float.format(this.saturation * 100)}%, ${HslaColor_float.format(this.lightness * 100)}%)`;
        }
        return `hsla(${Math.round(this.hue)}, ${HslaColor_float.format(this.saturation * 100)}%, ${HslaColor_float.format(this.lightness * 100)}%, ${HslaColor_float.format(this.alpha)})`;
    }
}

;// CONCATENATED MODULE: ./ts/Colors/RgbaColor.ts

class RgbaColor {
    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
    toString() {
        if (this.alpha === 1) {
            return `rgb(${Math.round(this.red)}, ${Math.round(this.green)}, ${Math.round(this.blue)})`;
        }
        return `rgba(${Math.round(this.red)}, ${Math.round(this.green)}, ${Math.round(this.blue)}, ${this.alpha})`;
    }
    static parse(str) {
        let hasAlfa = str[3] == "a";
        str = str.substr(hasAlfa ? 5 : 4, str.length - 1);
        let colorArr = str.split(",");
        return new RgbaColor(parseInt(colorArr[0]), parseInt(colorArr[1]), parseInt(colorArr[2]), hasAlfa ? parseFloat(colorArr[3]) : 1);
    }
    static toHslaColor(rgba) {
        let min, max, h = 0, s = 1, l = 1, maxcolor, rgb = [rgba.red / 255, rgba.green / 255, rgba.blue / 255];
        min = rgb[0];
        max = rgb[0];
        maxcolor = 0;
        for (let i = 0; i < rgb.length - 1; i++) {
            if (rgb[i + 1] <= min) {
                min = rgb[i + 1];
            }
            if (rgb[i + 1] >= max) {
                max = rgb[i + 1];
                maxcolor = i + 1;
            }
        }
        if (maxcolor === 0) {
            h = (rgb[1] - rgb[2]) / (max - min);
        }
        if (maxcolor == 1) {
            h = 2 + (rgb[2] - rgb[0]) / (max - min);
        }
        if (maxcolor == 2) {
            h = 4 + (rgb[0] - rgb[1]) / (max - min);
        }
        if (isNaN(h)) {
            h = 0;
        }
        h = h * 60;
        if (h < 0) {
            h = h + 360;
        }
        l = (min + max) / 2;
        if (min == max) {
            s = 0;
        }
        else {
            if (l < 0.5) {
                s = (max - min) / (max + min);
            }
            else {
                s = (max - min) / (2 - max - min);
            }
        }
        return new HslaColor(Math.round(h), s, l, rgba.alpha);
    }
    static toHexColorString(rgbaString) {
        const { red: r, green: g, blue: b } = RgbaColor.parse(rgbaString);
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }
}
RgbaColor.White = new RgbaColor(255, 255, 255, 1).toString();
RgbaColor.Black = new RgbaColor(0, 0, 0, 1).toString();
RgbaColor.Gray = new RgbaColor(127, 127, 127, 1).toString();
RgbaColor.Transparent = new RgbaColor(0, 0, 0, 0).toString();
RgbaColor.Link = new RgbaColor(0, 0, 238, 1).toString();

;// CONCATENATED MODULE: ./ts/Colors/ComponentShift.ts
var Component;
(function (Component) {
    Component[Component["None"] = 0] = "None";
    Component[Component["Background"] = 1] = "Background";
    Component[Component["HighlightedBackground"] = 2] = "HighlightedBackground";
    Component[Component["BackgroundNoContrast"] = 3] = "BackgroundNoContrast";
    Component[Component["Text"] = 4] = "Text";
    Component[Component["TextSelection"] = 5] = "TextSelection";
    Component[Component["HighlightedText"] = 6] = "HighlightedText";
    Component[Component["Link"] = 7] = "Link";
    Component[Component["Link$Hover"] = 8] = "Link$Hover";
    Component[Component["Link$Active"] = 9] = "Link$Active";
    Component[Component["VisitedLink"] = 10] = "VisitedLink";
    Component[Component["VisitedLink$Hover"] = 11] = "VisitedLink$Hover";
    Component[Component["VisitedLink$Active"] = 12] = "VisitedLink$Active";
    Component[Component["TextShadow"] = 13] = "TextShadow";
    Component[Component["Border"] = 14] = "Border";
    Component[Component["Scrollbar$Hover"] = 15] = "Scrollbar$Hover";
    Component[Component["Scrollbar$Normal"] = 16] = "Scrollbar$Normal";
    Component[Component["Scrollbar$Active"] = 17] = "Scrollbar$Active";
    Component[Component["Image"] = 18] = "Image";
    Component[Component["SvgBackground"] = 19] = "SvgBackground";
    Component[Component["BackgroundImage"] = 20] = "BackgroundImage";
    Component[Component["ButtonBackground"] = 21] = "ButtonBackground";
    Component[Component["ButtonBorder"] = 22] = "ButtonBorder";
})(Component || (Component = {}));

;// CONCATENATED MODULE: ./ts/Colors/ColorEntry.ts


var ColorReason;
(function (ColorReason) {
    ColorReason[ColorReason["None"] = 0] = "None";
    ColorReason[ColorReason["Ok"] = 1] = "Ok";
    ColorReason[ColorReason["Parent"] = 2] = "Parent";
    ColorReason[ColorReason["Previous"] = 3] = "Previous";
    ColorReason[ColorReason["Inherited"] = 4] = "Inherited";
    ColorReason[ColorReason["Transparent"] = 5] = "Transparent";
    ColorReason[ColorReason["NotFound"] = 6] = "NotFound";
    ColorReason[ColorReason["SameAsBackground"] = 7] = "SameAsBackground";
    ColorReason[ColorReason["SvgText"] = 8] = "SvgText";
    ColorReason[ColorReason["FixedInheritance"] = 9] = "FixedInheritance";
})(ColorReason || (ColorReason = {}));
var ColorInheritance;
(function (ColorInheritance) {
    ColorInheritance[ColorInheritance["Original"] = 0] = "Original";
    ColorInheritance[ColorInheritance["Afterwards"] = 1] = "Afterwards";
})(ColorInheritance || (ColorInheritance = {}));
const NotFound = {
    role: Component.Background,
    color: RgbaColor.White,
    light: 1,
    originalLight: 1,
    originalColor: RgbaColor.White,
    alpha: 1,
    reason: ColorReason.NotFound,
    isUpToDate: true,
    owner: null
};

;// CONCATENATED MODULE: ./ts/Colors/BaseColorProcessor.ts



class BaseColorProcessor {
    constructor(_app, _settingsManager) {
        this._app = _app;
        this._settingsManager = _settingsManager;
        _settingsManager.onSettingsChanged.addListener(this.onSettingsChanged, this);
        _settingsManager.onSettingsInitialized.addListener(this.onSettingsInitialized, this, EventHandlerPriority.High);
    }
    onSettingsInitialized(shift) {
        this._colorShift = this._settingsManager.shift[Component[this._component]];
    }
    onSettingsChanged(response, newSettings) {
        this._colorShift = this._settingsManager.shift[Component[this._component]];
    }
    scaleValue(currentValue, scaleLimit) {
        return Math.min(Math.min(currentValue, scaleLimit * Math.atan(currentValue * Math.PI / 2)), scaleLimit);
    }
    shiftHue(originalHue, targetHue, gravity) {
        let delta = (targetHue - originalHue + 180) % 360 - 180;
        delta = delta < -180 ? delta + 360 : delta;
        return originalHue + Math.round(delta * gravity);
    }
    applyBlueFilter(rgba) {
        if (this._settingsManager.currentSettings.blueFilter !== 0) {
            const blueFilter = this._settingsManager.currentSettings.blueFilter / 100;
            const newBlue = rgba.blue * (1 - blueFilter);
            const newRed = rgba.red + rgba.blue * blueFilter;
            const newGreen = newRed > 255 && rgba.green > 0
                ? Math.max(0, rgba.green - (newRed - 255) * blueFilter / Math.PI)
                : rgba.green;
            return new RgbaColor(Math.min(newRed, 255), newGreen, newBlue, rgba.alpha);
        }
        else {
            return rgba;
        }
    }
    static invertColor(rgbaString) {
        const hslaColor = RgbaColor.toHslaColor(RgbaColor.parse(rgbaString));
        hslaColor.lightness = 1 - hslaColor.lightness;
        return hslaColor.toString();
    }
}

;// CONCATENATED MODULE: ./ts/ContentScript/CssStyle.ts


const USP = {
    htm: {
        dom: {
            bgrColor: "backgroundColor",
            brdColor: "borderColor",
            fntColor: "color",
            shdColor: "textShadow"
        },
        css: {
            bgrColor: "background-color",
            brdColor: "border-color",
            fntColor: "color",
            shdColor: "text-shadow"
        },
        img: "IMG"
    },
    svg: {
        dom: {
            bgrColor: "fill",
            brdColor: "stroke",
            fntColor: "fill",
            shdColor: "textShadow"
        },
        css: {
            bgrColor: "fill",
            brdColor: "stroke",
            fntColor: "fill",
            shdColor: "text-shadow"
        },
        img: "image"
    }
};
class CssConstants {
    constructor() {
        this._0px = "0px";
        this._0s = "0s";
        this._200ms = "200ms";
        this.all = "all";
        this.none = "none";
        this.normal = "normal";
        this.important = "important";
        this.inherit = "inherit";
        this.px = "px";
        this.fixed = "fixed";
        this.absolute = "absolute";
        this.relative = "relative";
        this.hidden = "hidden";
        this.placeholderColor = "--placeholder-color";
        this.originalColor = "--original-color";
        this.originalBackgroundColor = "--original-background-color";
        this.editableContentColor = "--editable-content-color";
        this.editableContentBackgroundColor = "--editable-content-background-color";
        this.linkColor = "--link-color";
        this.visitedColor = "--visited-color";
        this.linkColorHover = "--link-color-hover";
        this.visitedColorHover = "--visited-color-hover";
        this.linkColorActive = "--link-color-active";
        this.visitedColorActive = "--visited-color-active";
        this.mlIgnoreVar = "--ml-ignore";
        this.mlInvertAttr = "ml-invert";
        this.role = "role";
    }
}
let CssStyle = class CssStyle extends CssConstants {
    constructor(doc) {
        super();
        for (let prop in doc.documentElement.style) {
            this[prop] = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
        }
    }
};
CssStyle = __decorate([
    injectable(),
    __metadata("design:paramtypes", [Document])
], CssStyle);


;// CONCATENATED MODULE: ./ts/Colors/ForegroundColorProcessor.ts











class ITextColorProcessor {
}
class ILinkColorProcessor extends ITextColorProcessor {
}
class IVisitedLinkColorProcessor extends ILinkColorProcessor {
}
class IHoverVisitedLinkColorProcessor extends IVisitedLinkColorProcessor {
}
class IActiveVisitedLinkColorProcessor extends IVisitedLinkColorProcessor {
}
class IHoverLinkColorProcessor extends ILinkColorProcessor {
}
class IActiveLinkColorProcessor extends ILinkColorProcessor {
}
class IHighlightedTextColorProcessor extends ITextColorProcessor {
}
class ITextShadowColorProcessor {
}
class IBorderColorProcessor {
}
class IButtonBorderColorProcessor extends IBorderColorProcessor {
}
class IButtonBackgroundColorProcessor {
}
class IHighlightedBackgroundColorProcessor {
}
class IScrollbarHoverColorProcessor {
}
class IScrollbarNormalColorProcessor {
}
class IScrollbarActiveColorProcessor {
}
class IDynamicTextColorProcessor extends ITextColorProcessor {
}
class IDynamicLinkColorProcessor extends ILinkColorProcessor {
}
class IDynamicVisitedLinkColorProcessor extends IVisitedLinkColorProcessor {
}
class IDynamicBorderColorProcessor extends IBorderColorProcessor {
}
class IDynamicButtonBackgroundColorProcessor extends IButtonBackgroundColorProcessor {
}
class ForegroundColorProcessor extends BaseColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
    }
    getInheritedColor(tag, rgbStr) {
        return null;
    }
    changeHslaColor(hsla, backgroundLightness, isGray, grayShift) {
        let shift = this._colorShift;
        if (isGray) {
            shift = grayShift;
            hsla.hue = shift.grayHue;
            hsla.saturation = shift.graySaturation;
        }
        else {
            if (shift.hueGravity) {
                hsla.hue = this.shiftHue(hsla.hue, shift.grayHue, shift.hueGravity);
            }
            hsla.saturation = this.scaleValue(hsla.saturation, shift.saturationLimit);
        }
        hsla.lightness = this.scaleValue(hsla.lightness, shift.lightnessLimit);
        const shiftContrast = shift.contrast / hsla.alpha;
        const currentContrast = Number((hsla.lightness - backgroundLightness).toFixed(2)), down = Number(Math.max(backgroundLightness - Math.min(Math.max(backgroundLightness - shiftContrast, 0), shift.lightnessLimit), 0).toFixed(2)), up = Number(Math.max(Math.min(backgroundLightness + shiftContrast, shift.lightnessLimit) - backgroundLightness, 0).toFixed(2));
        if (currentContrast < 0) {
            if (down >= up) {
                hsla.lightness = Math.max(backgroundLightness + Math.min(currentContrast, -shiftContrast), 0);
            }
            else {
                hsla.lightness = Math.min(backgroundLightness + shiftContrast, shift.lightnessLimit);
            }
        }
        else {
            if (up >= down) {
                hsla.lightness = Math.min(backgroundLightness + Math.max(currentContrast, shiftContrast), shift.lightnessLimit);
            }
            else {
                hsla.lightness = Math.max(backgroundLightness - shiftContrast, 0);
            }
        }
    }
    changeColor(rgbaString, backgroundLightness, tag, ignoreBlueFilter) {
        rgbaString = rgbaString || RgbaColor.Black;
        rgbaString = rgbaString === "none" ? RgbaColor.Transparent : rgbaString;
        const inheritedColor = this.getInheritedColor(tag, rgbaString);
        let inheritedColorValue = undefined;
        if (inheritedColor) {
            if (inheritedColor.backgroundLight === backgroundLightness &&
                inheritedColor.role === this._component) {
                inheritedColor.owner = this._app.isDebug ? tag : null;
                return inheritedColor;
            }
            else {
                inheritedColorValue = rgbaString;
                rgbaString = inheritedColor.originalColor;
            }
        }
        let rgba = RgbaColor.parse(rgbaString), result;
        if (rgba.alpha === 0) {
            result = this.processTransparentColor(rgbaString, backgroundLightness, inheritedColorValue, tag);
            return result;
        }
        else {
            const hsla = RgbaColor.toHslaColor(rgba);
            const originalLight = hsla.lightness, isGray = this.isGray(tag, rgbaString, hsla);
            this.changeHslaColor(hsla, backgroundLightness, isGray, isGray ? this.getGrayShift(tag, rgbaString, hsla) : this._colorShift);
            let newRgbColor = ignoreBlueFilter ? HslaColor.toRgbaColor(hsla)
                : this.applyBlueFilter(HslaColor.toRgbaColor(hsla));
            result = {
                role: this._component,
                color: newRgbColor.toString(),
                light: hsla.lightness,
                backgroundLight: backgroundLightness,
                originalLight: originalLight,
                originalColor: rgbaString,
                inheritedColor: inheritedColorValue,
                alpha: rgba.alpha,
                isUpToDate: true,
                reason: ColorReason.Ok,
                owner: this._app.isDebug ? tag : null,
            };
            return result;
        }
    }
    processTransparentColor(rgbaString, backgroundLightness, inheritedColorValue, tag) {
        return {
            role: this._component,
            color: null,
            light: 0,
            backgroundLight: backgroundLightness,
            originalLight: 0,
            originalColor: rgbaString,
            inheritedColor: inheritedColorValue,
            alpha: 0,
            isUpToDate: true,
            reason: ColorReason.Transparent,
            owner: this._app.isDebug ? tag : null,
        };
    }
    isGray(tag, rgbaString, hsla) {
        return this._colorShift.replaceAllHues || hsla.saturation < 0.1 && this._colorShift.graySaturation !== 0;
    }
    getGrayShift(tag, rgbaString, hsla) {
        return this._colorShift;
    }
}
let TextShadowColorProcessor = class TextShadowColorProcessor extends ForegroundColorProcessor {
    getInheritedColor(tag, rgbStr) {
        if (tag.parentElement && tag.parentElement instanceof HTMLElement === tag instanceof HTMLElement) {
            if (tag.parentElement.mlTextShadow) {
                let inheritedColor;
                if (tag.parentElement.mlTextShadow.color === rgbStr) {
                    inheritedColor = Object.assign({}, tag.parentElement.mlTextShadow);
                    inheritedColor.inheritance = ColorInheritance.Afterwards;
                }
                else if (tag.parentElement.mlTextShadow.originalColor === rgbStr ||
                    tag.parentElement.mlTextShadow.inheritedColor === rgbStr) {
                    if (!tag.style.textShadow && tag.tagName !== "CODE") {
                        inheritedColor = Object.assign({}, tag.parentElement.mlTextShadow);
                        inheritedColor.inheritance = ColorInheritance.Original;
                    }
                }
                if (inheritedColor) {
                    inheritedColor.color = null;
                    inheritedColor.reason = ColorReason.Inherited;
                    inheritedColor.base = this._app.isDebug ? tag.parentElement.mlTextShadow : null;
                    return inheritedColor;
                }
            }
            else {
                return this.getInheritedColor(tag.parentElement, rgbStr);
            }
        }
        return null;
    }
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.TextShadow;
    }
};
TextShadowColorProcessor = __decorate([
    injectable(ITextShadowColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], TextShadowColorProcessor);
let TextColorProcessor = class TextColorProcessor extends ForegroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._tagName = "p";
        this._defaultColors = new WeakMap();
        this._component = Component.Text;
    }
    isGray(tag, rgbaString, hsla) {
        return this._colorShift.replaceAllHues ||
            (hsla.saturation < 0.1 || rgbaString === this.getDefaultColor(tag.ownerDocument)) &&
                this._colorShift.graySaturation !== 0;
    }
    getDefaultColor(doc) {
        return this._defaultColors.get(doc);
    }
    calculateDefaultColor(doc, defaultColor) {
        let elementColor = defaultColor || "";
        if (!elementColor) {
            const element = doc.createElement(this._tagName);
            element.mlIgnore = true;
            element.href = "#";
            element.style.display = "none";
            doc.body.appendChild(element);
            const style = doc.defaultView.getComputedStyle(element, "");
            if (style) {
                elementColor = style.color;
            }
            else {
                elementColor = RgbaColor.Black;
            }
            element.remove();
        }
        this._defaultColors.set(doc, elementColor);
        return elementColor;
    }
    getInheritedColor(tag, rgbStr) {
        if (tag.parentElement && (tag.isPseudo ||
            tag.parentElement instanceof HTMLElement === tag instanceof HTMLElement) &&
            !(tag instanceof HTMLTableElement ||
                tag instanceof HTMLTableCellElement ||
                tag instanceof HTMLTableRowElement ||
                tag instanceof HTMLTableSectionElement)) {
            if (tag.parentElement.mlColor) {
                let inheritedColor;
                if (tag.parentElement.mlColor.color === rgbStr) {
                    inheritedColor = Object.assign({}, tag.parentElement.mlColor);
                    inheritedColor.inheritance = ColorInheritance.Afterwards;
                }
                else if (tag.parentElement.mlColor.originalColor === rgbStr ||
                    tag.parentElement.mlColor.inheritedColor === rgbStr ||
                    tag.parentElement.mlColor.intendedColor === rgbStr) {
                    const ns = tag instanceof SVGElement ? USP.svg : USP.htm;
                    if (!tag.style.getPropertyValue(ns.css.fntColor)) {
                        inheritedColor = Object.assign({}, tag.parentElement.mlColor);
                        inheritedColor.inheritance = ColorInheritance.Original;
                    }
                }
                if (inheritedColor) {
                    inheritedColor.intendedColor = inheritedColor.intendedColor || inheritedColor.color;
                    inheritedColor.color = null;
                    inheritedColor.reason = ColorReason.Inherited;
                    inheritedColor.base = this._app.isDebug ? tag.parentElement.mlColor : null;
                    return inheritedColor;
                }
            }
            else {
                return this.getInheritedColor(tag.parentElement, rgbStr);
            }
        }
        return null;
    }
};
TextColorProcessor = __decorate([
    injectable(ITextColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], TextColorProcessor);
let HighlightedTextColorProcessor = class HighlightedTextColorProcessor extends TextColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.HighlightedText;
    }
};
HighlightedTextColorProcessor = __decorate([
    injectable(IHighlightedTextColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], HighlightedTextColorProcessor);
let LinkColorProcessor = class LinkColorProcessor extends TextColorProcessor {
    constructor(app, settingsManager, _textColorProcessor) {
        super(app, settingsManager);
        this._textColorProcessor = _textColorProcessor;
        this._tagName = "a";
        this._component = Component.Link;
    }
    getInheritedColor(tag, rgbStr) {
        if (!(tag instanceof HTMLAnchorElement)) {
            return super.getInheritedColor(tag, rgbStr);
        }
        return null;
    }
    isGray(tag, rgbaString, hsla) {
        return this._colorShift.replaceAllHues ||
            (Math.abs(hsla.hue - this._settingsManager.shift.Text.grayHue) < 2) ||
            (hsla.saturation < 0.1 || rgbaString === this.getDefaultColor(tag.ownerDocument)) && this._colorShift.graySaturation !== 0 ||
            (hsla.saturation < 0.1 || rgbaString === this._textColorProcessor.getDefaultColor(tag.ownerDocument)) && this._settingsManager.shift.Text.graySaturation !== 0;
    }
    getGrayShift(tag, rgbaString, hsla) {
        if ((hsla.saturation < 0.1 ||
            Math.abs(hsla.hue - this._settingsManager.shift.Text.grayHue) < 2 ||
            rgbaString === this._textColorProcessor.getDefaultColor(tag.ownerDocument))) {
            return this._settingsManager.shift.Text;
        }
        else {
            return this._colorShift;
        }
    }
};
LinkColorProcessor = __decorate([
    injectable(ILinkColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager,
        ITextColorProcessor])
], LinkColorProcessor);
let VisitedLinkColorProcessor = class VisitedLinkColorProcessor extends LinkColorProcessor {
    constructor(app, settingsManager, textColorProcessor) {
        super(app, settingsManager, textColorProcessor);
        this._tagName = "a";
        this._component = Component.VisitedLink;
    }
};
VisitedLinkColorProcessor = __decorate([
    injectable(IVisitedLinkColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager,
        ITextColorProcessor])
], VisitedLinkColorProcessor);
let ActiveLinkColorProcessor = class ActiveLinkColorProcessor extends LinkColorProcessor {
    constructor(app, settingsManager, textColorProcessor) {
        super(app, settingsManager, textColorProcessor);
        this._tagName = "a";
        this._component = Component.Link$Active;
    }
};
ActiveLinkColorProcessor = __decorate([
    injectable(IActiveLinkColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager,
        ITextColorProcessor])
], ActiveLinkColorProcessor);
let HoverLinkColorProcessor = class HoverLinkColorProcessor extends LinkColorProcessor {
    constructor(app, settingsManager, textColorProcessor) {
        super(app, settingsManager, textColorProcessor);
        this._tagName = "a";
        this._component = Component.Link$Hover;
    }
};
HoverLinkColorProcessor = __decorate([
    injectable(IHoverLinkColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager,
        ITextColorProcessor])
], HoverLinkColorProcessor);
let ActiveVisitedLinkColorProcessor = class ActiveVisitedLinkColorProcessor extends LinkColorProcessor {
    constructor(app, settingsManager, textColorProcessor) {
        super(app, settingsManager, textColorProcessor);
        this._tagName = "a";
        this._component = Component.VisitedLink$Active;
    }
};
ActiveVisitedLinkColorProcessor = __decorate([
    injectable(IActiveVisitedLinkColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager,
        ITextColorProcessor])
], ActiveVisitedLinkColorProcessor);
let HoverVisitedLinkColorProcessor = class HoverVisitedLinkColorProcessor extends LinkColorProcessor {
    constructor(app, settingsManager, textColorProcessor) {
        super(app, settingsManager, textColorProcessor);
        this._tagName = "a";
        this._component = Component.VisitedLink$Hover;
    }
};
HoverVisitedLinkColorProcessor = __decorate([
    injectable(IHoverVisitedLinkColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager,
        ITextColorProcessor])
], HoverVisitedLinkColorProcessor);
let BorderColorProcessor = class BorderColorProcessor extends ForegroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.Border;
    }
};
BorderColorProcessor = __decorate([
    injectable(IBorderColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], BorderColorProcessor);
let ButtonBackgroundColorProcessor = class ButtonBackgroundColorProcessor extends ForegroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.ButtonBackground;
    }
    processTransparentColor(rgbaString, backgroundLightness, inheritedColorValue, tag) {
        return {
            role: this._component,
            color: null,
            reason: ColorReason.Parent,
            originalColor: rgbaString,
            owner: this._app.isDebug ? tag : null,
            light: backgroundLightness,
            backgroundLight: backgroundLightness,
            originalLight: 1,
            inheritedColor: inheritedColorValue,
            alpha: 1,
            isUpToDate: true
        };
    }
};
ButtonBackgroundColorProcessor = __decorate([
    injectable(IButtonBackgroundColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], ButtonBackgroundColorProcessor);
let HighlightedBackgroundColorProcessor = class HighlightedBackgroundColorProcessor extends ForegroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.HighlightedBackground;
    }
    processTransparentColor(rgbaString, backgroundLightness, inheritedColorValue, tag) {
        return {
            role: this._component,
            color: null,
            reason: ColorReason.Parent,
            originalColor: rgbaString,
            owner: this._app.isDebug ? tag : null,
            light: backgroundLightness,
            backgroundLight: backgroundLightness,
            originalLight: 1,
            inheritedColor: inheritedColorValue,
            alpha: 1,
            isUpToDate: true
        };
    }
};
HighlightedBackgroundColorProcessor = __decorate([
    injectable(IHighlightedBackgroundColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], HighlightedBackgroundColorProcessor);
let ButtonBorderColorProcessor = class ButtonBorderColorProcessor extends ForegroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.ButtonBorder;
    }
};
ButtonBorderColorProcessor = __decorate([
    injectable(IButtonBorderColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], ButtonBorderColorProcessor);
let ScrollbarHoverColorProcessor = class ScrollbarHoverColorProcessor extends ForegroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.Scrollbar$Hover;
    }
};
ScrollbarHoverColorProcessor = __decorate([
    injectable(IScrollbarHoverColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], ScrollbarHoverColorProcessor);
let ScrollbarNormalColorProcessor = class ScrollbarNormalColorProcessor extends ForegroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.Scrollbar$Normal;
    }
};
ScrollbarNormalColorProcessor = __decorate([
    injectable(IScrollbarNormalColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], ScrollbarNormalColorProcessor);
let ScrollbarActiveColorProcessor = class ScrollbarActiveColorProcessor extends ForegroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.Scrollbar$Active;
    }
};
ScrollbarActiveColorProcessor = __decorate([
    injectable(IScrollbarActiveColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], ScrollbarActiveColorProcessor);
let DynamicTextColorProcessor = class DynamicTextColorProcessor extends TextColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.Text;
    }
};
DynamicTextColorProcessor = __decorate([
    injectable(IDynamicTextColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IDynamicSettingsManager])
], DynamicTextColorProcessor);
let DynamicLinkColorProcessor = class DynamicLinkColorProcessor extends LinkColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager, null);
        this._component = Component.Link;
    }
    isGray(tag, rgbaString, hsla) {
        return true;
    }
    getGrayShift(tag, rgbaString, hsla) {
        return this._colorShift;
    }
};
DynamicLinkColorProcessor = __decorate([
    injectable(IDynamicLinkColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IDynamicSettingsManager])
], DynamicLinkColorProcessor);
let DynamicVisitedLinkColorProcessor = class DynamicVisitedLinkColorProcessor extends VisitedLinkColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager, null);
        this._component = Component.VisitedLink;
    }
    isGray(tag, rgbaString, hsla) {
        return true;
    }
    getGrayShift(tag, rgbaString, hsla) {
        return this._colorShift;
    }
};
DynamicVisitedLinkColorProcessor = __decorate([
    injectable(IDynamicVisitedLinkColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IDynamicSettingsManager])
], DynamicVisitedLinkColorProcessor);
let DynamicBorderColorProcessor = class DynamicBorderColorProcessor extends BorderColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.Border;
    }
};
DynamicBorderColorProcessor = __decorate([
    injectable(IDynamicBorderColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IDynamicSettingsManager])
], DynamicBorderColorProcessor);
let DynamicButtonBackgroundColorProcessor = class DynamicButtonBackgroundColorProcessor extends ButtonBackgroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.ButtonBackground;
    }
};
DynamicButtonBackgroundColorProcessor = __decorate([
    injectable(IDynamicButtonBackgroundColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IDynamicSettingsManager])
], DynamicButtonBackgroundColorProcessor);

;// CONCATENATED MODULE: ./ts/Colors/BackgroundColorProcessor.ts











class IBackgroundColorProcessor {
}
class ISvgBackgroundColorProcessor extends IBackgroundColorProcessor {
}
class IDynamicBackgroundColorProcessor extends IBackgroundColorProcessor {
}
class ITextSelectionColorProcessor extends IBackgroundColorProcessor {
}
class IDynamicTextSelectionColorProcessor extends ITextSelectionColorProcessor {
}
let BackgroundColorProcessor = class BackgroundColorProcessor extends BaseColorProcessor {
    constructor(app, settingsManager, highlightedBackgroundColorProcessor) {
        super(app, settingsManager);
        this.highlightedBackgroundColorProcessor = highlightedBackgroundColorProcessor;
        this._colors = new Map();
        this._lights = new Map();
        this._lightAreas = new Map();
        this._lightCounts = new Map();
        this._component = Component.Background;
    }
    onSettingsChanged(response, newSettings) {
        super.onSettingsChanged(response, newSettings);
        this.clear();
    }
    clear() {
        this._colors.clear();
        this._lights.clear();
        this._lightAreas.clear();
        this._lightCounts.clear();
    }
    isDark(rgbaString) {
        if (!rgbaString || rgbaString === RgbaColor.Transparent || rgbaString === RgbaColor.White ||
            rgbaString.startsWith("rgb(") && rgbaString.length === 18) {
            return false;
        }
        if (rgbaString === RgbaColor.Black) {
            return true;
        }
        const hsla = RgbaColor.toHslaColor(RgbaColor.parse(rgbaString));
        return hsla.alpha > 0 && (hsla.lightness || 0.01) / hsla.alpha <= 0.4;
    }
    tryGetTagArea(tag) {
        if (tag.mlArea === undefined) {
            tag.mlComputedStyle = tag.mlComputedStyle || tag.ownerDocument.defaultView.getComputedStyle(tag, "");
            if (tag.mlComputedStyle && tag.mlComputedStyle.width && tag.mlComputedStyle.width.endsWith("px") &&
                tag.mlComputedStyle.height && tag.mlComputedStyle.height.endsWith("px")) {
                let width = parseInt(tag.mlComputedStyle.width), height = parseInt(tag.mlComputedStyle.height);
                if (!isNaN(width) && !isNaN(height)) {
                    tag.mlArea = width * height;
                }
            }
        }
        return tag.mlArea;
    }
    getTagArea(tag) {
        if (tag.mlArea === undefined) {
            if (this.tryGetTagArea(tag) === undefined) {
                tag.mlRect = tag.mlRect || tag.getBoundingClientRect();
                tag.mlArea = tag.mlRect.width * tag.mlRect.height;
            }
        }
        return tag.mlArea;
    }
    tryUpdateLightArea(tag, lightness) {
        let lightCount = this._lightCounts.get(lightness) || 0;
        this._lightCounts.set(lightness, ++lightCount);
        if (lightCount < 10) {
            let area = this.tryGetTagArea(tag);
            if (area !== undefined) {
                let oldArea = this._lightAreas.get(lightness);
                if (oldArea && oldArea < area || !oldArea) {
                    this._lightAreas.set(lightness, area);
                }
            }
        }
    }
    changeHslaColor(hsla, increaseContrast, tag) {
        const shift = this._colorShift;
        if (shift.replaceAllHues || hsla.saturation < 0.1 && shift.graySaturation !== 0) {
            hsla.hue = shift.grayHue;
            hsla.saturation = shift.graySaturation;
        }
        else {
            if (shift.hueGravity) {
                hsla.hue = this.shiftHue(hsla.hue, shift.grayHue, shift.hueGravity);
            }
            hsla.saturation = this.scaleValue(hsla.saturation, shift.saturationLimit);
        }
        let light = hsla.lightness;
        if (increaseContrast) {
            let oldLight = this._lights.get(hsla.lightness);
            if (oldLight !== undefined) {
                light = oldLight;
                this.tryUpdateLightArea(tag, hsla.lightness);
            }
            else {
                const minLightDiff = shift.contrast * Math.atan(-shift.lightnessLimit * Math.PI / 2) + shift.contrast / 0.9;
                let thisTagArea = this.getTagArea(tag);
                if (this._lights.size > 0 && minLightDiff > 0) {
                    let prevLight = -1, nextLight = +2, prevOrigin = 0, nextOrigin = 1;
                    for (let [originalLight, otherLight] of this._lights) {
                        if (otherLight < light && otherLight > prevLight) {
                            prevLight = otherLight;
                            prevOrigin = originalLight;
                        }
                        if (otherLight > light && otherLight < nextLight) {
                            nextLight = otherLight;
                            nextOrigin = originalLight;
                        }
                    }
                    let prevArea = this._lightAreas.get(prevOrigin), nextArea = this._lightAreas.get(nextOrigin);
                    let deflect = 0;
                    if (prevArea !== undefined && nextArea !== undefined && prevArea !== nextArea) {
                        deflect = (nextLight - prevLight) *
                            (prevArea > nextArea
                                ? 0.5 - nextArea / prevArea
                                : prevArea / nextArea - 0.5);
                    }
                    if (nextLight - prevLight < minLightDiff * 2)
                        light = (prevLight + nextLight) / 2 + deflect;
                    else if (light - prevLight < minLightDiff)
                        light = prevLight + minLightDiff;
                    else if (nextLight - light < minLightDiff)
                        light = nextLight - minLightDiff;
                    light = Math.max(Math.min(light, 1), 0);
                }
                this._lights.set(hsla.lightness, light);
                this._lightAreas.set(hsla.lightness, thisTagArea);
                this._lightCounts.set(hsla.lightness, 1);
            }
        }
        hsla.lightness = this.scaleValue(light, shift.lightnessLimit);
    }
    changeColor(rgbaString, increaseContrast, tag, getParentBackground, ignoreBlueFilter) {
        rgbaString = !rgbaString || rgbaString === "none" ? RgbaColor.Transparent : rgbaString;
        let prevColor = increaseContrast ? this._colors.get(rgbaString) : null;
        if (prevColor) {
            if (prevColor.role === this._component) {
                this.tryUpdateLightArea(tag, prevColor.originalLight);
            }
            let newColor = Object.assign({}, prevColor);
            newColor.reason = ColorReason.Previous;
            newColor.originalColor = rgbaString;
            newColor.owner = this._app.isDebug ? tag : null;
            newColor.base = this._app.isDebug ? prevColor : null;
            return newColor;
        }
        else {
            let rgba = RgbaColor.parse(rgbaString);
            if (tag instanceof HTMLBodyElement && rgba.alpha === 0) {
                rgbaString = "body-trans";
                if (window.top === window.self) {
                    rgba = { red: 255, green: 255, blue: 255, alpha: 1 };
                }
                else {
                    return {
                        role: this._component,
                        color: null,
                        light: this._colorShift.lightnessLimit,
                        originalLight: 1,
                        originalColor: rgbaString,
                        alpha: 0,
                        isUpToDate: true,
                        reason: ColorReason.Transparent,
                        owner: this._app.isDebug ? tag : null,
                    };
                }
            }
            if (tag instanceof HTMLOptionElement || tag instanceof HTMLOptGroupElement) {
                if (tag.parentElement && tag.parentElement.mlBgColor && !tag.parentElement.mlBgColor.color) {
                    rgbaString = "option-trans";
                    rgba = { red: 255, green: 255, blue: 255, alpha: 1 };
                }
            }
            if (rgba.alpha === 0 && getParentBackground) {
                let parentBgColor = getParentBackground(tag);
                increaseContrast && this.tryUpdateLightArea(tag, parentBgColor.originalLight);
                let newColor = Object.assign({}, parentBgColor);
                newColor.color = null;
                newColor.reason = ColorReason.Parent;
                newColor.originalColor = rgbaString;
                newColor.owner = this._app.isDebug ? tag : null;
                newColor.base = this._app.isDebug ? parentBgColor : null;
                return newColor;
            }
            else {
                let hsla = RgbaColor.toHslaColor(rgba);
                if (this._component === Component.Background && increaseContrast &&
                    hsla.saturation > 0.39 && hsla.lightness < 0.86 &&
                    (this.getTagArea(tag) ? tag.mlArea < 16000 : false)) {
                    const result = this.highlightedBackgroundColorProcessor.changeColor(rgbaString, getParentBackground ? getParentBackground(tag).light : this._colorShift.lightnessLimit, tag);
                    increaseContrast && this._colors.set(rgbaString, result);
                    return result;
                }
                else {
                    const originalLight = hsla.lightness;
                    this.changeHslaColor(hsla, increaseContrast, tag);
                    const newRgbColor = ignoreBlueFilter ? HslaColor.toRgbaColor(hsla)
                        : this.applyBlueFilter(HslaColor.toRgbaColor(hsla));
                    const result = {
                        role: this._component,
                        color: newRgbColor.toString(),
                        light: hsla.lightness,
                        originalLight: originalLight,
                        originalColor: rgbaString,
                        alpha: rgba.alpha,
                        reason: ColorReason.Ok,
                        isUpToDate: true,
                        owner: this._app.isDebug ? tag : null
                    };
                    increaseContrast && this._colors.set(rgbaString, result);
                    return result;
                }
            }
        }
    }
};
BackgroundColorProcessor = __decorate([
    injectable(IBackgroundColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager,
        IHighlightedBackgroundColorProcessor])
], BackgroundColorProcessor);
let SvgBackgroundColorProcessor = class SvgBackgroundColorProcessor extends BackgroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager, null);
        this._component = Component.SvgBackground;
    }
};
SvgBackgroundColorProcessor = __decorate([
    injectable(ISvgBackgroundColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], SvgBackgroundColorProcessor);
let TextSelectionColorProcessor = class TextSelectionColorProcessor extends BackgroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager, null);
        this._component = Component.TextSelection;
    }
};
TextSelectionColorProcessor = __decorate([
    injectable(ITextSelectionColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], TextSelectionColorProcessor);
let DynamicBackgroundColorProcessor = class DynamicBackgroundColorProcessor extends BackgroundColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager, null);
        this._component = Component.Background;
    }
};
DynamicBackgroundColorProcessor = __decorate([
    injectable(IDynamicBackgroundColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IDynamicSettingsManager])
], DynamicBackgroundColorProcessor);
let DynamicTextSelectionColorProcessor = class DynamicTextSelectionColorProcessor extends TextSelectionColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
        this._component = Component.TextSelection;
    }
};
DynamicTextSelectionColorProcessor = __decorate([
    injectable(IDynamicTextSelectionColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IDynamicSettingsManager])
], DynamicTextSelectionColorProcessor);

;// CONCATENATED MODULE: ./ts/Chrome/FirefoxThemeProcessor.ts









let FirefoxThemeProcessor = class FirefoxThemeProcessor {
    constructor(app, settingsBus, settingsManager, backgroundColorProcessor, textColorProcessor, linkColorProcessor, visitedLinkColorProcessor, borderColorProcessor, selectionColorProcessor, buttonColorProcessor) {
        if (app.browserName === BrowserName.Firefox) {
            browser.runtime.getBrowserInfo().then(info => {
                const mainVersion = parseInt(info.version.split('.')[0]);
                const applySettingsOnTheme = ([settings, wnd, defaultSettings]) => {
                    if (defaultSettings.changeBrowserTheme) {
                        settingsManager.changeSettings(settings, true);
                        if (!settingsManager.isActive) {
                            settingsManager.changeSettings(defaultSettings, true);
                        }
                        if (settingsManager.isActive) {
                            const darkGray = new RgbaColor(80, 80, 80, 1).toString(), normalGray = new RgbaColor(180, 180, 180, 1).toString(), lightGray = new RgbaColor(240, 240, 240, 1).toString();
                            const mainBgColor = backgroundColorProcessor
                                .changeColor(RgbaColor.White, true, document.body), mainTextColor = textColorProcessor
                                .changeColor(RgbaColor.Black, mainBgColor.light, document.body), midBgColor = backgroundColorProcessor
                                .changeColor(settings.backgroundLightnessLimit < 40
                                ? darkGray
                                : RgbaColor.White, true, document.body), midTextColor = textColorProcessor
                                .changeColor(RgbaColor.Black, midBgColor.light, document.body), midBorderColor = borderColorProcessor
                                .changeColor(RgbaColor.Black, midBgColor.light, document.body), darkBgColor = backgroundColorProcessor
                                .changeColor(darkGray, true, document.body), darkTextColor = textColorProcessor
                                .changeColor(RgbaColor.Black, darkBgColor.light, document.body), darkBorderColor = borderColorProcessor
                                .changeColor(RgbaColor.Black, darkBgColor.light, document.body), buttonColor = buttonColorProcessor
                                .changeColor(RgbaColor.White, mainBgColor.light, document.body), buttonHoverColor = buttonColorProcessor
                                .changeColor(normalGray, buttonColor.light, document.body), buttonActiveColor = buttonColorProcessor
                                .changeColor(lightGray, buttonColor.light, document.body), lightTextColor = textColorProcessor
                                .changeColor(RgbaColor.Black, buttonColor.light, document.body), activeTextColor = textColorProcessor
                                .changeColor(RgbaColor.Black, buttonActiveColor.light, document.body), lightBorderColor = borderColorProcessor
                                .changeColor(RgbaColor.Black, buttonColor.light, document.body), linkColor = linkColorProcessor
                                .changeColor(darkGray, buttonColor.light, document.body), visitedLinkColor = visitedLinkColorProcessor
                                .changeColor(darkGray, buttonColor.light, document.body), selectionBgColor = selectionColorProcessor
                                .changeColor(RgbaColor.White, false, document.body);
                            const theme = { colors: {} };
                            if (mainVersion < 59) {
                                Object.assign(theme.colors, {
                                    accentcolor: darkBgColor.color,
                                    textcolor: darkTextColor.color
                                });
                                if (mainVersion >= 57) {
                                    Object.assign(theme.colors, {
                                        toolbar_text: lightTextColor.color,
                                    });
                                }
                            }
                            if (mainVersion < 60) {
                                theme.images = {
                                    "headerURL": "img/none.svg"
                                };
                            }
                            if (mainVersion >= 57) {
                                Object.assign(theme.colors, {
                                    toolbar: buttonColor.color,
                                    toolbar_field: midBgColor.color,
                                    toolbar_field_text: midTextColor.color
                                });
                            }
                            if (mainVersion >= 58) {
                                Object.assign(theme.colors, {
                                    toolbar_bottom_separator: lightBorderColor.color,
                                    toolbar_top_separator: darkBorderColor.color,
                                    toolbar_vertical_separator: darkBorderColor.color
                                });
                            }
                            if (mainVersion >= 59) {
                                Object.assign(theme.colors, {
                                    frame: darkBgColor.color,
                                    bookmark_text: lightTextColor.color,
                                    tab_background_text: darkTextColor.color,
                                    toolbar_field_border: midBorderColor.color,
                                    toolbar_field_separator: darkBorderColor.color
                                });
                            }
                            if (mainVersion >= 60) {
                                Object.assign(theme.colors, {
                                    button_background_hover: buttonHoverColor.color,
                                    button_background_active: buttonActiveColor.color,
                                    tab_line: linkColor.color,
                                    tab_loading: linkColor.color,
                                    icons_attention: visitedLinkColor.color,
                                    popup: midBgColor.color,
                                    popup_text: midTextColor.color,
                                    popup_border: midBorderColor.color
                                });
                            }
                            if (mainVersion >= 63) {
                                Object.assign(theme.colors, {
                                    ntp_background: mainBgColor.color,
                                    ntp_text: mainTextColor.color
                                });
                            }
                            if (mainVersion >= 64) {
                                Object.assign(theme.colors, {
                                    sidebar: buttonColor.color,
                                    sidebar_highlight: buttonActiveColor.color,
                                    sidebar_highlight_text: activeTextColor.color,
                                    sidebar_text: lightTextColor.color,
                                    sidebar_border: darkBorderColor.color
                                });
                            }
                            console.log(theme);
                            if (wnd.id !== undefined) {
                                browser.theme.update(wnd.id, theme);
                            }
                            else {
                                browser.theme.update(theme);
                            }
                        }
                        else {
                            browser.theme.reset();
                        }
                    }
                };
                const getCurrentWindow = () => browser.windows.getCurrent();
                const updateTheme = () => {
                    settingsManager.getDefaultSettings().then(defaultSettings => {
                        Promise.all([
                            settingsBus.getCurrentSettings(),
                            getCurrentWindow(),
                            defaultSettings
                        ])
                            .then(applySettingsOnTheme)
                            .catch(ex => {
                            Promise.all([
                                defaultSettings,
                                getCurrentWindow(),
                                defaultSettings
                            ])
                                .then(applySettingsOnTheme)
                                .catch(exx => {
                                if (defaultSettings.changeBrowserTheme) {
                                    browser.theme.reset();
                                }
                            });
                        });
                    });
                };
                chrome.tabs.onActivated
                    .addListener(updateTheme);
                chrome.tabs.onUpdated
                    .addListener((tabId, info) => info.status === "complete" && updateTheme());
                settingsBus.onSettingsApplied
                    .addListener((resp, set) => {
                    resp(set);
                    updateTheme();
                }, null);
                settingsBus.onIsEnabledToggleRequested
                    .addListener((resp, isEnabled) => {
                    resp(isEnabled);
                    settingsManager.getDefaultSettings()
                        .then(defaultSettings => {
                        if (!isEnabled && defaultSettings.changeBrowserTheme) {
                            browser.theme.reset();
                        }
                    });
                }, null);
            });
        }
    }
};
FirefoxThemeProcessor = __decorate([
    injectable(IThemeProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        ISettingsBus,
        IDynamicSettingsManager,
        IDynamicBackgroundColorProcessor,
        IDynamicTextColorProcessor,
        IDynamicLinkColorProcessor,
        IDynamicVisitedLinkColorProcessor,
        IDynamicBorderColorProcessor,
        IDynamicTextSelectionColorProcessor,
        IDynamicButtonBackgroundColorProcessor])
], FirefoxThemeProcessor);


;// CONCATENATED MODULE: ./ts/Chrome/ChromeBackgroundPageStarter.ts











new BackgroundPageStarter(ChromeApplicationInstaller, ChromeStorageManager, ChromeCommandListener, ChromeApplicationSettings, ChromeStorageManager, ChromeSettingsBus, ChromeZoomService, ChromeUninstallUrlSetter, ChromeTranslationAccessor, FirefoxThemeProcessor, ChromeBackgroundMessageBus);

})();

/******/ })()
;