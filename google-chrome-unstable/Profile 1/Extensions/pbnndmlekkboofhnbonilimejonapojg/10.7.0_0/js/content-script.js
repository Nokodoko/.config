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


;// CONCATENATED MODULE: ./ts/Popup/ICommandManager.ts
class ICommandManager {
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromeCommandManager.ts




let ChromeCommandManager = class ChromeCommandManager {
    constructor(_chromePromise) {
        this._chromePromise = _chromePromise;
    }
    getCommands() {
        return this._chromePromise.commands.getAll();
    }
};
ChromeCommandManager = __decorate([
    injectable(ICommandManager),
    __metadata("design:paramtypes", [ChromePromise])
], ChromeCommandManager);


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


;// CONCATENATED MODULE: ./ts/ContentScript/IContentMessageBus.ts
class IContentMessageBus {
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromeContentMessageBus.ts





let ChromeContentMessageBus = class ChromeContentMessageBus {
    constructor(app) {
        this._onMessage = new ArgumentedEventDispatcher();
        this.openConnection();
    }
    get onMessage() {
        return this._onMessage.event;
    }
    postMessage(message) {
        this.openConnection().postMessage(message);
    }
    openConnection(port) {
        if (!this.connection || port) {
            this.connection = chrome.runtime.connect({ name: 'content' });
            this.connection.onMessage.addListener((msg, port) => {
                this._onMessage.raise(msg);
            });
            this.connection.onDisconnect.addListener(this.openConnection.bind(this));
        }
        return this.connection;
    }
};
ChromeContentMessageBus = __decorate([
    injectable(IContentMessageBus),
    __metadata("design:paramtypes", [IApplicationSettings])
], ChromeContentMessageBus);


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
const excludeSettingsForSave = [
    "isEnabled", "location", "colorSchemeName", "userColorSchemes",
    "userColorSchemeIds", "changeBrowserTheme", "restoreColorsOnCopy",
    "restoreColorsOnPrint"
];
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

;// CONCATENATED MODULE: ./ts/Events/HtmlEvent.ts
const _handlers = new WeakMap();
class HtmlEvent_HtmlEvent {
    static addEventListener(target, type, listener, thisArg, useCapture, ...args) {
        if (target) {
            HtmlEvent_HtmlEvent.removeEventListener(target, type, listener);
            let handlersOnTarget = _handlers.get(target);
            if (handlersOnTarget === undefined) {
                handlersOnTarget = new Map();
                _handlers.set(target, handlersOnTarget);
            }
            let handlersOfType = handlersOnTarget.get(type);
            if (handlersOfType === undefined) {
                handlersOfType = new Map();
                handlersOnTarget.set(type, handlersOfType);
            }
            let boundHandler = thisArg || args.length > 0 ? listener.bind(thisArg, ...args) : listener;
            handlersOfType.set(listener, boundHandler);
            target.addEventListener(type, boundHandler, useCapture);
            return boundHandler;
        }
        else
            throw new Error("target is not a valid EventTarget object");
    }
    static removeEventListener(target, type, listener) {
        let handlersOnTarget = _handlers.get(target);
        if (handlersOnTarget !== undefined) {
            let handlersOfType = handlersOnTarget.get(type);
            if (handlersOfType !== undefined) {
                let boundHandler = handlersOfType.get(listener);
                if (boundHandler !== undefined) {
                    target.removeEventListener(type, boundHandler, true);
                    target.removeEventListener(type, boundHandler, false);
                    handlersOfType.delete(listener);
                    if (handlersOfType.size === 0) {
                        handlersOnTarget.delete(type);
                        if (handlersOnTarget.size === 0) {
                            _handlers.delete(target);
                        }
                    }
                }
            }
        }
    }
    static removeAllEventListeners(target, type) {
        let handlersOnTarget = _handlers.get(target);
        if (handlersOnTarget !== undefined) {
            for (let tp of type ? [type] : Array.from(handlersOnTarget.keys())) {
                let handlersOfType = handlersOnTarget.get(tp);
                if (handlersOfType !== undefined) {
                    for (let boundHandler of handlersOfType.values()) {
                        target.removeEventListener(tp, boundHandler, true);
                        target.removeEventListener(tp, boundHandler, false);
                    }
                    handlersOfType.clear();
                    handlersOnTarget.delete(tp);
                }
            }
        }
    }
}

;// CONCATENATED MODULE: ./ts/ContentScript/SettingsManager.ts












const dom = HtmlEvent_HtmlEvent;
class ISettingsManager {
}
let SettingsManager = class SettingsManager extends BaseSettingsManager {
    constructor(_rootDocument, app, storageManager, settingsBus, matchPatternProcessor, i18n, rec) {
        super(_rootDocument, app, storageManager, settingsBus, matchPatternProcessor, i18n, rec);
        this.skipOneSettingsUpdate = false;
        settingsBus.onCurrentSettingsRequested.addListener(this.onCurrentSettingsRequested, this);
        settingsBus.onIsEnabledToggleRequested.addListener(this.onIsEnabledToggleRequested, this);
        settingsBus.onNewSettingsApplicationRequested.addListener(this.onNewSettingsApplicationRequested, this);
        settingsBus.onSettingsDeletionRequested.addListener(this.onSettingsDeletionRequested, this);
        storageManager.onStorageChanged.addListener(this.onStorageChanged, this);
    }
    initCurSet() {
        super.initCurSet();
        this.notifySettingsApplied();
    }
    updateSchedule() {
        super.updateSchedule();
        if (this._scheduleUpdateTimeout) {
            clearTimeout(this._scheduleUpdateTimeout);
        }
        if (this.UseSystemDarkSchedule) {
            dom.addEventListener(super.PrefersDarkColorSchemeMediaMatch(), "change", this.initCurrentSettings, this);
        }
        else if (this._scheduleStartTime !== 0 || this._scheduleFinishTime !== 24) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const millisecondsUntilNextSwitch = [
                this._scheduleStartTime, this._scheduleFinishTime,
                this._scheduleStartTime + 24, this._scheduleFinishTime + 24
            ]
                .filter(h => h > this._curTime)
                .reduce((next, h) => h < next ? h : next, 99) * 60 * 60 * 1000 +
                today.getTime() - Date.now();
            this._scheduleUpdateTimeout = window.setTimeout(() => {
                this.initCurrentSettings();
            }, millisecondsUntilNextSwitch);
        }
    }
    initCurrentSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            const storage = Object.assign(Object.assign(Object.assign({}, ColorSchemes.default), ColorSchemes.dimmedDust), { [this._settingsKey]: {} });
            try {
                const defaultSettings = yield this._storageManager.get(storage);
                const settings = defaultSettings[this._settingsKey];
                delete defaultSettings[this._settingsKey];
                yield this.processDefaultSettings(defaultSettings, true);
                Object.assign(this._currentSettings, this._defaultSettings);
                if (settings) {
                    this.assignSettings(this._currentSettings, settings);
                }
                this.updateSchedule();
                this.initCurSet();
                if (!this.isInit) {
                    this._onSettingsInitialized.raise(this._shift);
                }
                else {
                    this._onSettingsChanged.raise(() => null, this._shift);
                }
            }
            catch (ex) {
                this._app.isDebug && console.error(ex);
            }
        });
    }
    onSettingsDeletionRequested(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (window.top === window.self) {
                response(null);
            }
            if (this.isSelfMaintainable) {
                yield this._storageManager.remove(this._settingsKey);
            }
        });
    }
    onNewSettingsApplicationRequested(response, newSettings) {
        this._currentSettings = newSettings;
        this.saveCurrentSettings();
        this.updateSchedule();
        this.initCurSet();
        this._onSettingsChanged.raise(response, this._shift);
    }
    onIsEnabledToggleRequested(response, isEnabled) {
        if (isEnabled !== this._currentSettings.isEnabled) {
            this._currentSettings.isEnabled = isEnabled;
            this._onSettingsChanged.raise(response, this._shift);
            this.notifySettingsApplied();
        }
    }
    onCurrentSettingsRequested(response) {
        this._currentSettings.location = this._rootDocument.location.href;
        response(this._currentSettings);
    }
    onStorageChanged(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (changes && this.skipOneSettingsUpdate && this._settingsKey in changes) {
                this.skipOneSettingsUpdate = false;
            }
            else if (changes && (this._settingsKey in changes
                ||
                    this._currentSettings.colorSchemeId === ColorSchemes.default.colorSchemeId &&
                        Object.keys(changes).find(key => !!key && !key.startsWith("cs:") && key !== "userColorSchemeIds")
                ||
                    this._currentSettings.useDefaultSchedule &&
                        ("scheduleStartHour" in changes || "scheduleFinishHour" in changes)
                ||
                    ("restoreColorsOnCopy" in changes || "restoreColorsOnPrint" in changes)
                ||
                    `cs:${this._currentSettings.colorSchemeId}` in changes
                ||
                    this._currentSettings.colorSchemeId === ColorSchemes.default.colorSchemeId &&
                        `cs:${this.defaultColorSchemeId}` in changes
                ||
                    'sync' in changes)) {
                this.initDefaultColorSchemes();
                yield this.initCurrentSettings();
            }
        });
    }
    get isSelfMaintainable() {
        let hasAccessToMainFrame = true;
        try {
            const test = window.top.location.hostname;
        }
        catch (_a) {
            hasAccessToMainFrame = false;
        }
        return window.top === window.self || !hasAccessToMainFrame;
    }
    saveCurrentSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSelfMaintainable) {
                try {
                    this.skipOneSettingsUpdate = true;
                    if (this._currentSettings.colorSchemeId === ColorSchemes.default.colorSchemeId) {
                        yield this._storageManager.set({
                            [this._settingsKey]: {
                                runOnThisSite: this._currentSettings.runOnThisSite
                            }
                        });
                    }
                    else if (this._currentSettings.colorSchemeId && this._currentSettings.colorSchemeId !== CustomColorSchemeId) {
                        yield this._storageManager.set({
                            [this._settingsKey]: {
                                colorSchemeId: this._currentSettings.colorSchemeId,
                                runOnThisSite: this._currentSettings.runOnThisSite
                            }
                        });
                    }
                    else {
                        let setting;
                        const forSave = {};
                        for (setting in this._currentSettings) {
                            if (excludeSettingsForSave.indexOf(setting) == -1) {
                                forSave[setting] = this._currentSettings[setting];
                            }
                        }
                        yield this._storageManager.set({ [this._settingsKey]: forSave });
                    }
                }
                catch (error) {
                    const reason = yield this.getErrorReason(error);
                    alert("Midnight Lizard\n" + this._i18n.getMessage("applyOnPageFailureMessage") + reason);
                }
            }
        });
    }
    getSettingNameForCookies(propertyName) {
        return "ML" + propertyName.match(/^[^A-Z]{1,4}|[A-Z][^A-Z]{0,2}/g).join("").toUpperCase();
    }
};
SettingsManager = __decorate([
    injectable(ISettingsManager),
    injectable(IBaseSettingsManager, Scope.ExistingInstance),
    __metadata("design:paramtypes", [Document,
        IApplicationSettings,
        IStorageManager,
        ISettingsBus,
        IMatchPatternProcessor,
        ITranslationAccessor,
        IRecommendations])
], SettingsManager);

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

;// CONCATENATED MODULE: ./ts/Utils/Promise.ts
function forEachPromise(arrayOfParams, action, initialDelay = 0, getNextDelay) {
    let fePromise = null;
    let lastDelay = initialDelay;
    arrayOfParams.forEach((params, index) => {
        lastDelay = getNextDelay ? getNextDelay(params, lastDelay, index) : lastDelay;
        if (index === 0 && lastDelay === 0) {
            fePromise = Promise.resolve(params ? action(...params) : action());
        }
        else {
            fePromise = Promise
                .all([action, lastDelay, params, fePromise])
                .then(([act, delay, params, prev]) => {
                params && params.push(prev);
                return setTimeoutPromise(act, delay, params);
            });
        }
    });
    return fePromise;
}
function setTimeoutPromise(action, delay, params) {
    params && params.push(delay);
    return new Promise((resolve, reject) => {
        if (delay) {
            setTimeout((r, a, p) => p ? r(a(...p)) : r(a()), delay, resolve, action, params);
        }
        else {
            params ? resolve(action(...params)) : resolve(action());
        }
    });
}
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus[PromiseStatus["Success"] = 0] = "Success";
    PromiseStatus[PromiseStatus["Failure"] = 1] = "Failure";
})(PromiseStatus || (PromiseStatus = {}));
class HandledPromiseResult {
    constructor(status, data) {
        this.status = status;
        this.data = data;
    }
}
function handlePromise(promise) {
    return promise && promise.then(result => new HandledPromiseResult(PromiseStatus.Success, result), error => new HandledPromiseResult(PromiseStatus.Failure, error));
}

;// CONCATENATED MODULE: ./ts/ContentScript/Pseudos.ts
var PseudoStyleStandard;
(function (PseudoStyleStandard) {
    PseudoStyleStandard[PseudoStyleStandard["BackgroundImage"] = 0] = "BackgroundImage";
    PseudoStyleStandard[PseudoStyleStandard["InvertedBackgroundImage"] = 1] = "InvertedBackgroundImage";
})(PseudoStyleStandard || (PseudoStyleStandard = {}));
var PseudoClass;
(function (PseudoClass) {
    PseudoClass[PseudoClass["Hover"] = 0] = "Hover";
    PseudoClass[PseudoClass["Focus"] = 1] = "Focus";
    PseudoClass[PseudoClass["Active"] = 2] = "Active";
    PseudoClass[PseudoClass["Checked"] = 3] = "Checked";
})(PseudoClass || (PseudoClass = {}));
var PseudoType;
(function (PseudoType) {
    PseudoType[PseudoType["Before"] = 0] = "Before";
    PseudoType[PseudoType["After"] = 1] = "After";
})(PseudoType || (PseudoType = {}));
let lastId = 0;
class PseudoElementStyle {
    constructor() {
        this._props = new Map();
    }
    get cssText() {
        return Array.from(this._props)
            .map(([key, [value, priority]]) => `${key}:${value}${priority}`)
            .join(";");
    }
    setProperty(propertyName, value, priority) {
        value
            ? this._props.set(propertyName, [value, (priority ? "!important" : "")])
            : this._props.delete(propertyName);
    }
    getPropertyValue(propertyName) {
        let [value] = this._props.get(propertyName) || [undefined];
        return value;
    }
}
class PseudoElement {
    constructor(type, parent, computedStyle) {
        this.isPseudo = true;
        this.bgColor = "";
        this.selectors = "";
        this.originalFilter = null;
        let typeName = PseudoType[type].toLowerCase();
        this.id = (++lastId).toString();
        this.classList = [this.className = "::" + typeName];
        this.tagName = typeName;
        this.selectorText = `[${this.tagName}-style="${this.id}"]:not(imp)${this.className}`;
        this.parentElement = parent;
        this.mlComputedStyle = computedStyle;
        this.mlRect = parent.mlRect;
        this.style = new PseudoElementStyle();
        this.ownerDocument = parent.ownerDocument;
        this.stylePromise = new Promise((resolve, reject) => this.resolveCss = resolve);
    }
    getBoundingClientRect() {
        this.mlRect = this.parentElement.mlRect = this.parentElement.mlRect || this.parentElement.getBoundingClientRect();
        this.mlArea = this.mlRect.width * this.mlRect.height;
        return this.mlRect;
    }
    getAttribute(attributeName) {
        return this.parentElement.getAttribute(attributeName);
    }
    applyStyleChanges(standardCssText) {
        const cssText = standardCssText === undefined ? this.style.cssText : standardCssText;
        let css = cssText === "" ? "" : `${this.selectorText}{${cssText}}`;
        this.resolveCss(css);
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


;// CONCATENATED MODULE: ./ts/ContentScript/PreloadManager.ts






class IPreloadManager {
}
const mlIsActiveAttribute = "ml-is-active";
const mlIsActiveProperty = "--" + mlIsActiveAttribute;
const mlBackgroundLightnessLimitProperty = "--ml-background-lightness-limit";
const mlPpreloadFilterProperty = "--ml-preload-filter";
const mlViewAttribute = "ml-view";
const mlModeAttribute = "ml-mode";
const mlModeProperty = "--" + mlModeAttribute;
let PreloadManager = class PreloadManager {
    constructor(doc, _module, _settingsManager, _app) {
        this._module = _module;
        this._settingsManager = _settingsManager;
        this._app = _app;
        let localStorageIsAccessable = true;
        try {
            localStorage.getItem("test");
        }
        catch (_a) {
            localStorageIsAccessable = false;
        }
        this._html = doc.documentElement;
        if (localStorageIsAccessable && !this._app.isInIncognitoMode) {
            this.applyCachedSettings();
            _settingsManager.onSettingsInitialized.addListener(this.onSettingsInitialized, this, EventHandlerPriority.After);
            _settingsManager.onSettingsChanged.addListener(this.onSettingsChanged, this, EventHandlerPriority.After);
        }
    }
    applyCachedSettings() {
        if (localStorage.getItem(mlIsActiveProperty) === "true") {
            this._html.setAttribute(mlViewAttribute, window.top === window.self ? "top" : "child");
            this._html.setAttribute(mlIsActiveAttribute, "");
            const cachedMode = localStorage.getItem(mlModeProperty);
            if (cachedMode) {
                this._html.setAttribute(mlModeAttribute, cachedMode);
            }
            if (this._module.name === ExtensionModule.PopupWindow) {
                this._html.style.setProperty(mlPpreloadFilterProperty, localStorage.getItem(mlPpreloadFilterProperty) || "none");
            }
            else {
                const bgLight = localStorage.getItem(mlBackgroundLightnessLimitProperty);
                this._html.style.setProperty(mlBackgroundLightnessLimitProperty, bgLight === null ? "1" : bgLight);
            }
        }
    }
    applyActualSettings(shift) {
        if (this._settingsManager.isActive) {
            this._html.setAttribute(mlIsActiveAttribute, "");
            if (this._module.name === ExtensionModule.PopupWindow) {
                this._html.mlComputedStyle = this._html.mlComputedStyle ||
                    this._html.ownerDocument.defaultView.getComputedStyle(this._html);
                const textFilter = this._html.mlComputedStyle.getPropertyValue("--ml-text-filter");
                localStorage.setItem(mlPpreloadFilterProperty, textFilter);
            }
            else {
                const bgLight = shift.Background.lightnessLimit.toString();
                localStorage.setItem(mlBackgroundLightnessLimitProperty, bgLight);
                localStorage.setItem(mlModeProperty, this._settingsManager.currentSettings.mode);
            }
        }
        else {
            this._html.removeAttribute(mlModeAttribute);
            this._html.removeAttribute(mlViewAttribute);
            this._html.removeAttribute(mlIsActiveAttribute);
            this._html.style.removeProperty(mlBackgroundLightnessLimitProperty);
            this._html.style.removeProperty(mlPpreloadFilterProperty);
        }
        localStorage.setItem(mlIsActiveProperty, this._settingsManager.isActive ? "true" : "false");
    }
    onSettingsInitialized(shift) {
        this.applyActualSettings(shift);
    }
    onSettingsChanged(resp, shift) {
        this.applyActualSettings(shift);
    }
};
PreloadManager = __decorate([
    injectable(IPreloadManager),
    __metadata("design:paramtypes", [Document,
        CurrentExtensionModule,
        IBaseSettingsManager,
        IApplicationSettings])
], PreloadManager);

;// CONCATENATED MODULE: ./ts/Utils/String.ts
function escapeRegex(str) {
    return str.replace(/[\[\](){}?*+\^\$\\\.|\-]/g, "\\$&");
}
function trim(str, characters, flags = "gi") {
    characters = escapeRegex(characters);
    return str.replace(new RegExp("^[" + characters + "]+|[" + characters + "]+$", flags), '');
}
function hashCode(str) {
    let hash = 0, chr, len;
    if (str && str.length !== 0) {
        for (let i = 0, len = str.length; i < len; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash = hash | 0;
        }
    }
    return hash;
}

;// CONCATENATED MODULE: ./ts/Utils/Array.ts
function sliceIntoChunks(array, chunk) {
    return array.reduce((ar, it, i) => {
        const ix = Math.floor(i / chunk);
        if (!ar[ix])
            ar[ix] = [];
        ar[ix].push(it);
        return ar;
    }, new Array());
}
function setsAreEqual(set1, set2) {
    if (!set1 && !!set2 || !!set1 && !set2)
        return false;
    if (!set1 && !set2)
        return true;
    if (set1.size !== set2.size)
        return false;
    for (const a of set1)
        if (!set2.has(a))
            return false;
    return true;
}
function firstSetIncludesAllElementsOfSecondSet(set1, set2) {
    if (!set1 || !set1.size || !set2 || !set2.size)
        return false;
    for (const a of set2)
        if (!set1.has(a))
            return false;
    return true;
}

;// CONCATENATED MODULE: ./ts/Utils/RegExp.ts
let capturingGroupsCount = 0;
function resetCapturingGroups() {
    capturingGroupsCount = 0;
}
function Next() {
    return ++capturingGroupsCount;
}
function Last() {
    return capturingGroupsCount || undefined;
}
const Or = "|", OR = Or;
const BeginningOfLine = "^", BOF = (/* unused pure expression or super */ null && (BeginningOfLine));
const EndOfLine = "$", EOL = (/* unused pure expression or super */ null && (EndOfLine));
const WhiteSpace = "\\s", WSP = (/* unused pure expression or super */ null && (WhiteSpace));
const NotWhiteSpace = "\\S", NWSP = (/* unused pure expression or super */ null && (NotWhiteSpace));
const Word = "\\w", WRD = (/* unused pure expression or super */ null && (Word));
const NotWord = "\\W", NWRD = (/* unused pure expression or super */ null && (NotWord));
const AnyCharacter = ".", ACH = (/* unused pure expression or super */ null && (AnyCharacter)), Whatever = (/* unused pure expression or super */ null && (ACH));
const Dot = "\\.", DOT = (/* unused pure expression or super */ null && (Dot));
const Comma = ",", COM = (/* unused pure expression or super */ null && (Comma));
const Hash = "#", HSH = (/* unused pure expression or super */ null && (Hash));
const Asterisk = "\\*", AST = (/* unused pure expression or super */ null && (Asterisk));
const Colon = ":", CLN = (/* unused pure expression or super */ null && (Colon));
const Minus = "\\-", MNS = (/* unused pure expression or super */ null && (Minus));
const LeftParenthesis = "\\(", LPR = (/* unused pure expression or super */ null && (LeftParenthesis));
const RightParenthesis = "\\)", RPR = (/* unused pure expression or super */ null && (RightParenthesis));
const LeftBrace = "\\{", LBR = (/* unused pure expression or super */ null && (LeftBrace));
const RightBrace = "\\}", RBR = (/* unused pure expression or super */ null && (RightBrace));
const LeftBracket = "\\[", LBK = (/* unused pure expression or super */ null && (LeftBracket));
const RightBracket = "\\]", RBK = (/* unused pure expression or super */ null && (RightBracket));
const WordBoundary = "\\b", WBN = (/* unused pure expression or super */ null && (WordBoundary));
const NotWordBoundary = "\\B", NWBN = (/* unused pure expression or super */ null && (NotWordBoundary));
const Digit = "\\d", DGT = (/* unused pure expression or super */ null && (Digit));
const NotDigit = "\\D", NDGT = (/* unused pure expression or super */ null && (NotDigit));
const NewLine = "\\n", NLN = (/* unused pure expression or super */ null && (NewLine));
const CarriageReturn = "\r", CRT = (/* unused pure expression or super */ null && (CarriageReturn));
function $var(varName) {
    return `$\{${varName}}`;
}
function applyVars(exp, vars) {
    let result = exp;
    vars.forEach((varValue, varName) => result = result.replace(RegExp(RegExp_escape($var(varName)), "g"), varValue));
    return result;
}
const RegExp_char = RegExp_escape;
function RegExp_escape(str) {
    return str && str.replace ? str.replace(/[\[\](){}?*+\^\$\\\.|\-]/g, "\\$&") : "";
}
function shrink(str) {
    return str && str.replace ? str.replace(/\s(?=(\s+))/g, "").trim() : "";
}
function or(...arrayOfExpressions) {
    return arrayOfExpressions.join("|");
}
const join = and, combine = and;
function and(...arrayOfExpressions) {
    return arrayOfExpressions.join("");
}
const oneOf = fromSet;
function fromSet(...charSet) {
    return `[${charSet.join("")}]`;
}
function outOfSet(...charSet) {
    return `[^${charSet.join("")}]`;
}
const anytime = any;
function any(exp) {
    return `${exp}*`;
}
const sometime = some;
function some(exp) {
    return `${exp}+`;
}
const neverOrOnce = noneOrOne;
function noneOrOne(exp) {
    return `${exp}?`;
}
function exactly(occurs, exp) {
    return `${exp}{${occurs}}`;
}
function strictly(minOccurs, maxOccurs, exp) {
    return `${exp}{${minOccurs},${maxOccurs}}`;
}
function remember(...exps) {
    return `(${exps.join("")})`;
}
function forget(...exps) {
    return `(?:${exps.join("")})`;
}
function followedBy(...exps) {
    return `(?=${exps.join("")})`;
}
function notFollowedBy(...exps) {
    return `(?!${exps.join("")})`;
}
function succeededBy(index, ...exps) {
    return `(?=(${exps.join("")}))\\${index}`;
}
function wholeWord(...exps) {
    return `\\b${exps.join("")}\\b`;
}
const completely = wholeString;
function wholeString(...exps) {
    return `^${exps.join("")}$`;
}
function somethingIn(left, right) {
    left = RegExp_escape(left);
    right = RegExp_escape(right);
    return `${left}[^${right}]+${right}`;
}
const SomethingInParentheses = somethingIn("(", ")");
const SomethingInBraces = somethingIn("{", "}");
const SomethingInBrackets = somethingIn("[", "]");
const SomethingInChevrons = somethingIn("<", ">");
const Literal = fromSet(Word, Minus);

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

;// CONCATENATED MODULE: ./ts/ContentScript/StyleSheetProcessor.ts















const StyleSheetProcessor_dom = (/* unused pure expression or super */ null && (HtmlEvent));
var Var;
(function (Var) {
    Var[Var["id"] = 0] = "id";
    Var[Var["tagName"] = 1] = "tagName";
    Var[Var["className"] = 2] = "className";
    Var[Var["notThisTagId"] = 3] = "notThisTagId";
    Var[Var["notThisClassNames"] = 4] = "notThisClassNames";
})(Var || (Var = {}));
class IStyleSheetProcessor {
}
let StyleSheetProcessor = class StyleSheetProcessor {
    constructor(css, settingsManager, _doc, _app, _msgBus) {
        this._doc = _doc;
        this._app = _app;
        this._msgBus = _msgBus;
        this._storageIsAvailable = true;
        this._selectorsStorageKey = "ml-selectors";
        this._styleRefsStorageKey = "ml-style-refs";
        this._stylesLimit = 500;
        this._trimmedStylesLimit = 500;
        this._lastSelectorsCache = { selectors: 0, styles: 0 };
        this._passedTransitionSelectors = new Set();
        this._styleProps = [
            { prop: "background-color", priority: 1 },
            { prop: "color", priority: 1 },
            { prop: "fill", priority: 2 },
            { prop: "border-color", priority: 2 },
            { prop: "stroke", priority: 2 },
            { prop: "background-image", priority: 3 },
            { prop: "background-position", priority: 3 },
            { prop: "background-size", priority: 4 },
            { prop: "text-shadow", priority: 4 }
        ];
        this._passedPseudoSelectors = new Set();
        this._mediaQueries = new Map();
        this._externalCssPromises = new Map();
        this._externalCssResolvers = new Map();
        this._externalCssRejectors = new Map();
        this._selectors = new Array();
        this._selectorsQuality = undefined;
        this._preFilteredSelectors = new Map();
        this._preFilteredSelectorsCache = new Map();
        this._styleRefs = new Set();
        this._styleRefsCache = new Set();
        this._onElementsForUserActionObservationFound = new ArgumentedEventDispatcher();
        this._css = css;
        this._transitionForbiddenProperties = new Set([
            this._css.all,
            this._css.background,
            this._css.backgroundColor,
            this._css.backgroundImage,
            this._css.color,
            this._css.border,
            this._css.borderBottom,
            this._css.borderBottomColor,
            this._css.borderColor,
            this._css.borderLeft,
            this._css.borderLeftColor,
            this._css.borderRight,
            this._css.borderRightColor,
            this._css.borderTop,
            this._css.borderTopColor,
            this._css.textShadow,
            this._css.filter
        ]);
        this._includeStylesRegExp = this.compileIncludeStylesRegExp();
        _msgBus.onMessage.addListener(this.onMessageFromBackgroundPage, this);
        window.setInterval(() => {
            if (this._storageIsAvailable) {
                try {
                    if (this._preFilteredSelectors.size && this._styleRefs.size &&
                        this._lastSelectorsCache.selectors !== this._preFilteredSelectors.size &&
                        this._lastSelectorsCache.styles !== this._styleRefs.size) {
                        sessionStorage.setItem(this._selectorsStorageKey, JSON.stringify(Array.from(this._preFilteredSelectors)));
                        sessionStorage.setItem(this._styleRefsStorageKey, JSON.stringify(Array.from(this._styleRefs)));
                        this._lastSelectorsCache = {
                            selectors: this._preFilteredSelectors.size,
                            styles: this._styleRefs.size
                        };
                    }
                }
                catch (ex) {
                    _app.isDebug && console.error(ex);
                }
            }
        }, 15000);
        try {
            const selectorsJsonData = sessionStorage.getItem(this._selectorsStorageKey);
            if (selectorsJsonData) {
                const selArray = JSON.parse(selectorsJsonData);
                this._preFilteredSelectorsCache = new Map(selArray);
            }
            const styleRefsJsonData = sessionStorage.getItem(this._styleRefsStorageKey);
            if (styleRefsJsonData) {
                const refsArray = JSON.parse(styleRefsJsonData);
                this._styleRefsCache = new Set(refsArray);
            }
        }
        catch (ex) {
            this._storageIsAvailable = false;
            _app.isDebug && console.error(ex);
        }
        settingsManager.onSettingsChanged
            .addListener(() => this._passedPseudoSelectors.clear(), this);
    }
    getCssPromises(doc) {
        return Array.from(this._externalCssPromises.values());
    }
    getSelectorsCount(doc) { return this._selectors.length; }
    getSelectorsQuality(doc) { return this._selectorsQuality; }
    get onElementsForUserActionObservationFound() {
        return this._onElementsForUserActionObservationFound.event;
    }
    compileExcludeStylesRegExp() {
        resetCapturingGroups();
        return completely(sometime(forget(sometime(forget(succeededBy(Next(), BeginningOfLine, any(outOfSet(Comma)), WhiteSpace, OR, Comma, any(outOfSet(Comma)), WhiteSpace, OR, BeginningOfLine), succeededBy(Next(), neverOrOnce(succeededBy(Next(), any(outOfSet(Dot, Comma, EndOfLine)))), Dot, $var(Var[Var.notThisClassNames]), some(Literal), Or, notFollowedBy($var(Var[Var.tagName]), WordBoundary), some(Word), Or, any(Word), Hash, $var(Var[Var.notThisTagId]), some(Literal), WordBoundary, notFollowedBy(Minus), Or, neverOrOnce(succeededBy(Next(), any(outOfSet(Colon, Comma, EndOfLine)))), exactly(2, Colon)), any(outOfSet(Comma, WhiteSpace, EndOfLine)), followedBy(Comma, Or, EndOfLine))))));
    }
    compileIncludeStylesRegExp() {
        return forget(forget(BeginningOfLine, Or, WhiteSpace), forget(neverOrOnce(forget($var(Var[Var.tagName]))), neverOrOnce(forget(Hash, $var(Var[Var.id]))), anytime(forget(Dot, $var(Var[Var.className]))), WordBoundary, notFollowedBy(Minus), Or, neverOrOnce(forget(Asterisk))), notFollowedBy(some(Word)), notFollowedBy(exactly(2, Colon)), any(outOfSet(Comma, Dot, Hash, WhiteSpace, EndOfLine)), followedBy(Comma, Or, EndOfLine));
    }
    checkPropertyIsValuable(style, propName) {
        let propVal = style.getPropertyValue(propName);
        return propVal !== "" && propVal != "initial" && propVal != "inherited";
    }
    processDocumentStyleSheets(doc) {
        const styleRefs = new Set(), transitionSelectors = new Set();
        let styleRefIsDone = false;
        let styleRefCssText = "";
        let styleRules = new Array();
        let styleSheets = Array.from(doc.styleSheets);
        let cssRules;
        for (let sheet of styleSheets) {
            if (sheet) {
                try {
                    cssRules = sheet.cssRules;
                }
                catch (_a) {
                    cssRules = undefined;
                }
                if (cssRules) {
                    if (cssRules.length > 0 && (sheet instanceof CSSMediaRule || !sheet.ownerNode || !sheet.ownerNode.mlIgnore)) {
                        if (sheet instanceof CSSStyleSheet && (sheet.href || sheet.mlExternal ||
                            sheet.ownerNode instanceof HTMLElement && sheet.ownerNode.hasAttribute("ml-external"))) {
                            styleRefs.add(sheet.href || sheet.mlExternal ||
                                sheet.ownerNode.getAttribute("ml-external"));
                            styleRefIsDone = true;
                        }
                        else {
                            styleRefIsDone = false;
                        }
                        styleRefCssText = "";
                        for (let rule of Array.from(cssRules)) {
                            if (rule instanceof CSSStyleRule) {
                                let style = rule.style;
                                if (this._styleProps.some(p => !!style.getPropertyValue(p.prop))) {
                                    styleRules.push(rule);
                                    if (!styleRefIsDone) {
                                        styleRefCssText += rule.cssText;
                                    }
                                }
                                const transitionDuration = style.getPropertyValue(this._css.transitionDuration);
                                if (transitionDuration && transitionDuration !== this._css._0s) {
                                    if (style.getPropertyValue(this._css.transitionProperty)
                                        .split(", ")
                                        .find(p => this._transitionForbiddenProperties.has(p))) {
                                        transitionSelectors.add(rule.selectorText);
                                    }
                                }
                            }
                            else if (rule instanceof CSSImportRule) {
                                styleSheets.push(rule.styleSheet);
                            }
                            else if (rule instanceof CSSMediaRule) {
                                if (this.validateMediaQuery(doc, rule.conditionText)) {
                                    styleSheets.push(rule);
                                }
                            }
                        }
                        if (styleRefCssText) {
                            styleRefs.add(hashCode(styleRefCssText).toString());
                        }
                    }
                }
                else if (sheet instanceof CSSStyleSheet && sheet.href &&
                    !/font/.test(sheet.href)) {
                    if (!this._externalCssPromises.has(sheet.href)) {
                        let cssPromise = fetch(sheet.href).then(resp => resp.text()).catch(ex => {
                            const url = (sheet.href);
                            if (this._app.isDebug) {
                                console.error(`Error during css file download: ${url}\nDetails: ${ex.message || ex}`);
                            }
                            this._msgBus.postMessage(new FetchExternalCss(url));
                            return new Promise((res, rej) => {
                                this._externalCssResolvers.set(url, res);
                                this._externalCssRejectors.set(url, rej);
                            });
                        });
                        this._externalCssPromises.set(sheet.href, handlePromise(Promise.all([cssPromise, sheet.href])
                            .then(([css, href]) => this.insertExternalCss(css, href))));
                    }
                }
            }
        }
        let maxPriority = 1;
        let filteredStyleRules = styleRules;
        if (transitionSelectors.size) {
            this.findElementsWithTransition(doc, transitionSelectors);
        }
        this.findElementsForUserActionObservation(doc, styleRules);
        this._styleProps.forEach(p => maxPriority = p.priority > maxPriority ? p.priority : maxPriority);
        let styleProps = this._styleProps;
        let selectorsQuality = maxPriority;
        while (maxPriority-- > 1 && filteredStyleRules.length > this._stylesLimit) {
            selectorsQuality--;
            styleProps = styleProps.filter(p => p.priority <= maxPriority);
            filteredStyleRules = filteredStyleRules.filter(r => styleProps.some(p => !!r.style.getPropertyValue(p.prop)));
        }
        if (filteredStyleRules.length > this._stylesLimit) {
            selectorsQuality = 0;
            let trimmer = (x) => /active|hover|disable|check|visit|link|focus|select|enable/gi.test(x.selectorText);
            let trimmedStyleRules = styleRules.filter(trimmer);
            if (trimmedStyleRules.length > this._trimmedStylesLimit) {
                filteredStyleRules = filteredStyleRules.filter(trimmer);
            }
            else {
                filteredStyleRules = trimmedStyleRules;
            }
        }
        this._selectorsQuality = selectorsQuality;
        this._selectors = filteredStyleRules.map(sr => sr.selectorText);
        if (firstSetIncludesAllElementsOfSecondSet(this._styleRefsCache, styleRefs)) {
            this._styleRefs = this._styleRefsCache;
            this._preFilteredSelectors = this._preFilteredSelectorsCache;
        }
        else {
            this._styleRefs = styleRefs;
            this._preFilteredSelectors.clear();
        }
    }
    onMessageFromBackgroundPage(message) {
        var _a, _b;
        if (message) {
            switch (message.type) {
                case MessageType.ExternalCssFetchCompleted:
                    (_a = this._externalCssResolvers.get(message.url)) === null || _a === void 0 ? void 0 : _a(message.cssText);
                    break;
                case MessageType.ExternalCssFetchFailed:
                    (_b = this._externalCssRejectors.get(message.url)) === null || _b === void 0 ? void 0 : _b(message.error);
                case MessageType.ErrorMessage:
                    this._app.isDebug && console.error(message);
                default:
                    break;
            }
        }
    }
    insertExternalCss(cssText, url) {
        let style = this._doc.createElement('style');
        style.setAttribute("ml-external", url);
        style.innerText = cssText;
        style.disabled = true;
        (this._doc.head || this._doc.documentElement).appendChild(style);
        if (style.sheet) {
            style.sheet.disabled = true;
        }
    }
    findElementsWithTransition(doc, transitionSelectors) {
        for (const selector of sliceIntoChunks(Array
            .from(transitionSelectors), 50)
            .map(x => x.join(","))) {
            if (selector && !this._passedTransitionSelectors.has(selector)) {
                try {
                    this._passedTransitionSelectors.add(selector);
                    doc.body.querySelectorAll(selector).forEach(tag => tag.hasTransition = true);
                }
                catch (ex) {
                    this._app.isDebug && console.error(ex);
                }
            }
        }
    }
    findElementsForUserActionObservation(doc, rules) {
        for (const pseudoClass of getEnumValues(PseudoClass)) {
            const pseudoClassRegExp = this.getPseudoClassRegExp(pseudoClass);
            for (const selector of sliceIntoChunks(Array.from(new Set(rules
                .filter(rule => rule.selectorText.search(pseudoClassRegExp) !== -1)
                .map(rule => rule.selectorText.replace(pseudoClassRegExp, "$1")))), 50)
                .map(x => x.join(","))) {
                if (selector && !this._passedPseudoSelectors.has(selector)) {
                    try {
                        this._passedPseudoSelectors.add(selector);
                        const elements = doc.body.querySelectorAll(selector);
                        if (elements.length > 0) {
                            this._onElementsForUserActionObservationFound.raise([pseudoClass, elements]);
                        }
                    }
                    catch (ex) {
                        this._app.isDebug && console.error(ex);
                    }
                }
            }
        }
    }
    getElementMatchedSelectors(tag) {
        if (tag instanceof PseudoElement) {
            return tag.selectors;
        }
        else {
            let preFilteredSelectors = this.getPreFilteredSelectors(tag);
            let wrongSelectors = new Array();
            let result = preFilteredSelectors.filter((selector) => {
                try {
                    return tag.matches(selector);
                }
                catch (ex) {
                    wrongSelectors.push(selector);
                    this._app.isDebug && console.error(ex);
                    return false;
                }
            });
            wrongSelectors.forEach(w => preFilteredSelectors.splice(preFilteredSelectors.indexOf(w), 1));
            return result.join("\n");
        }
    }
    getPreFilteredSelectors(tag) {
        let key = `${tag.tagName}#${tag.id}.${tag.classList.toString()}`;
        let preFilteredSelectors = this._preFilteredSelectors.get(key);
        if (preFilteredSelectors === undefined) {
            let notThisClassNames = "", className = "";
            if (tag.classList && tag.classList.length > 0) {
                className = forget(Array.prototype.map.call(tag.classList, (c) => RegExp_escape(c)).join(Or));
            }
            let vars = new Map();
            vars.set(Var[Var.id], RegExp_escape(tag.id));
            vars.set(Var[Var.tagName], tag.tagName);
            vars.set(Var[Var.className], className);
            let includeRegExpText = applyVars(this._includeStylesRegExp, vars);
            let includeRegExp = new RegExp(includeRegExpText, "gi");
            preFilteredSelectors = this._selectors.filter(selector => selector.search(includeRegExp) !== -1);
            this._preFilteredSelectors.set(key, preFilteredSelectors);
        }
        return preFilteredSelectors;
    }
    canHavePseudoClass(tag, preFilteredSelectors, pseudoClass) {
        let pseudoRegExp = this.getPseudoClassRegExp(pseudoClass);
        return preFilteredSelectors.some(s => s.search(pseudoRegExp) !== -1 &&
            tag.matches(s.replace(pseudoRegExp, "$1")));
    }
    getPseudoClassRegExp(pseudoClass) {
        return new RegExp(remember(outOfSet(LeftParenthesis, WhiteSpace)) +
            Colon + PseudoClass[pseudoClass] + WordBoundary + notFollowedBy(Minus), "gi");
    }
    validateMediaQuery(doc, mediaQuery) {
        let mediaResult = this._mediaQueries.get(mediaQuery);
        if (mediaResult === undefined) {
            mediaResult = doc.defaultView.matchMedia(mediaQuery).matches;
            this._mediaQueries.set(mediaQuery, mediaResult);
        }
        return mediaResult;
    }
};
StyleSheetProcessor = __decorate([
    injectable(IStyleSheetProcessor),
    __metadata("design:paramtypes", [CssStyle,
        IBaseSettingsManager,
        Document,
        IApplicationSettings,
        IContentMessageBus])
], StyleSheetProcessor);

;// CONCATENATED MODULE: ./ts/ContentScript/DocumentObserver.ts






const DocumentObserver_ArgEventDispatcher = ArgumentedEventDispatcher;
const mutationThrottleTime = 30, maxMutationsCount = 300;
var ObservationState;
(function (ObservationState) {
    ObservationState[ObservationState["Active"] = 0] = "Active";
    ObservationState[ObservationState["Stopped"] = 1] = "Stopped";
})(ObservationState || (ObservationState = {}));
class IDocumentObserver {
}
let DocumentObserver = class DocumentObserver {
    constructor(_rootDocument, _settingsManager, _styleSheetProcessor) {
        this._rootDocument = _rootDocument;
        this._settingsManager = _settingsManager;
        this._styleSheetProcessor = _styleSheetProcessor;
        this._updateObserverConfig = {
            attributes: true, attributeFilter: ["ml-update"]
        };
        this._bodyObserverConfig = {
            subtree: true, childList: true, attributeOldValue: true,
            attributes: true, attributeFilter: ["class", "style", "fill", "stroke", "disabled"]
        };
        this._simpleBodyObserverConfig = {
            subtree: true, childList: true, attributes: true, attributeFilter: ["class"]
        };
        this._filterBodyObserverConfig = {
            subtree: true, childList: true, attributeOldValue: true,
            attributes: true, attributeFilter: ["class", "style", "disabled"]
        };
        this._headObserverConfig = {
            childList: true
        };
        this._bodyObservers = new WeakMap();
        this._headObservers = new WeakMap();
        this._updateObservers = new WeakMap();
        this._onClassChanged = new DocumentObserver_ArgEventDispatcher();
        this._onUpdateChanged = new DocumentObserver_ArgEventDispatcher();
        this._onStyleChanged = new DocumentObserver_ArgEventDispatcher();
        this._onElementAdded = new DocumentObserver_ArgEventDispatcher();
        _settingsManager.onSettingsChanged.addListener(this.beforeSettingsChanged, this, EventHandlerPriority.High);
    }
    get onClassChanged() {
        return this._onClassChanged.event;
    }
    get onUpdateChanged() {
        return this._onUpdateChanged.event;
    }
    get onStyleChanged() {
        return this._onStyleChanged.event;
    }
    get onElementsAdded() {
        return this._onElementAdded.event;
    }
    beforeSettingsChanged(response, shift) {
        if (!this._settingsManager.isActive) {
            this.stopDocumentObservation(this._rootDocument);
        }
    }
    startDocumentUpdateObservation(doc) {
        let updateObserver = this._updateObservers.get(doc);
        if (updateObserver === undefined) {
            this._updateObservers.set(doc, updateObserver =
                new MutationObserver(this.updateObserverCallback.bind(this)));
        }
        updateObserver.observe(doc.documentElement, this._updateObserverConfig);
    }
    stopDocumentUpdateObservation(doc) {
        const updateObserver = this._updateObservers.get(doc);
        if (updateObserver !== undefined) {
            updateObserver.disconnect();
        }
    }
    startDocumentObservation(doc, resumeState) {
        if (resumeState !== ObservationState.Stopped) {
            let bodyObserver = this._bodyObservers.get(doc);
            if (bodyObserver === undefined) {
                this._bodyObservers.set(doc, bodyObserver = new MutationObserver(this.bodyObserverCallback.bind(this)));
            }
            bodyObserver.observe(doc.body, this._settingsManager.isComplex ? this._bodyObserverConfig
                : this._settingsManager.isSimple ? this._simpleBodyObserverConfig
                    : this._filterBodyObserverConfig);
            bodyObserver.state = ObservationState.Active;
            if (doc.head && this._settingsManager.isComplex) {
                let headObserver = this._headObservers.get(doc);
                if (headObserver === undefined) {
                    this._headObservers.set(doc, headObserver = new MutationObserver(this.headObserverCallback.bind(this)));
                }
                headObserver.observe(doc.head, this._headObserverConfig);
            }
        }
    }
    stopDocumentObservation(doc) {
        let originalState = undefined;
        const bodyObserver = this._bodyObservers.get(doc);
        if (bodyObserver !== undefined) {
            let mutations = bodyObserver.takeRecords();
            originalState = bodyObserver.state;
            bodyObserver.disconnect();
            bodyObserver.state = ObservationState.Stopped;
            setTimeout(() => this.bodyObserverCallback(mutations, bodyObserver), 1);
        }
        if (doc.head) {
            const headObserver = this._headObservers.get(doc);
            if (headObserver !== undefined) {
                let mutations = headObserver.takeRecords();
                headObserver.disconnect();
                headObserver.state = ObservationState.Stopped;
                if (this._settingsManager.isComplex) {
                    setTimeout(() => this.headObserverCallback(mutations, headObserver), 1);
                }
            }
        }
        return originalState;
    }
    bodyObserverCallback(mutations, observer) {
        let classChanges = new Set(), childListChanges = new Set(), styleChanges = new Set();
        const now = Date.now();
        mutations.forEach(mutation => {
            switch (mutation.type) {
                case "attributes":
                    if ((mutation.target.mlTimestamp &&
                        now - mutation.target.mlTimestamp < mutationThrottleTime)) {
                        mutation.target.mlMutationThrottledCount =
                            (mutation.target.mlMutationThrottledCount || 0) + 1;
                    }
                    if ((!mutation.target.mlMutationThrottledCount ||
                        mutation.target.mlMutationThrottledCount < maxMutationsCount) &&
                        (mutation.target.mlBgColor || mutation.target.mlInvert ||
                            mutation.target instanceof HTMLBodyElement)) {
                        switch (mutation.attributeName) {
                            case "class":
                                if (mutation.target instanceof Element &&
                                    mutation.oldValue !== mutation.target.className) {
                                    classChanges.add(mutation.target);
                                }
                                break;
                            case "style":
                            case "fill":
                            case "stroke":
                            case "disabled":
                                if (mutation.target instanceof Element &&
                                    (this._settingsManager.isComplex || mutation.target.mlInvert) &&
                                    mutation.oldValue !== mutation.target.getAttribute(mutation.attributeName)) {
                                    if (mutation.attributeName === "fill" ||
                                        mutation.attributeName === "stroke" ||
                                        mutation.attributeName === "disabled") {
                                        mutation.target.mlVisualAttributeChanged = true;
                                    }
                                    styleChanges.add(mutation.target);
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                case "childList":
                    Array.from(mutation.addedNodes)
                        .forEach((node) => node instanceof Element &&
                        childListChanges.add(node));
                    break;
                default:
                    break;
            }
        });
        if (childListChanges.size > 0) {
            this._onElementAdded.raise(childListChanges);
            childListChanges.forEach(tag => {
                classChanges.delete(tag);
                styleChanges.delete(tag);
            });
        }
        if (styleChanges.size > 0) {
            const tracking = new Map();
            styleChanges.forEach(tag => {
                if (classChanges.has(tag)) {
                    tracking.set(tag, tag.mlTimestamp);
                }
            });
            this._onStyleChanged.raise(styleChanges);
            tracking.forEach((time, tag) => {
                if (tag.mlTimestamp !== time) {
                    classChanges.delete(tag);
                }
            });
        }
        if (classChanges.size > 0) {
            this._onClassChanged.raise(classChanges);
        }
        if (!this._settingsManager.isActive) {
            observer.disconnect();
        }
    }
    headObserverCallback(mutations, observer) {
        let mutation = mutations
            .find(m => Array.prototype.slice.call(m.addedNodes)
            .find((x) => x instanceof HTMLStyleElement && !x.mlIgnore));
        if (mutation) {
            this._styleSheetProcessor.processDocumentStyleSheets(mutation.target.ownerDocument);
        }
    }
    updateObserverCallback(mutations, observer) {
        this._onUpdateChanged.raise(mutations[0].target);
    }
};
DocumentObserver = __decorate([
    injectable(IDocumentObserver),
    __metadata("design:paramtypes", [Document,
        IBaseSettingsManager,
        IStyleSheetProcessor])
], DocumentObserver);

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

;// CONCATENATED MODULE: ./ts/Colors/RangeFillColorProcessor.ts









class IRangeFillColorProcessor {
}
let RangeFillColorProcessor = class RangeFillColorProcessor extends BaseColorProcessor {
    constructor(app, settingsManager) {
        super(app, settingsManager);
    }
    changeColor(shift, textLight, bgLight, ignoreBlueFilter) {
        const lightness = (textLight + 3 * bgLight) / 4;
        const resultColor = HslaColor.toRgbaColor(new HslaColor(shift.Border.grayHue, Math.min(shift.Border.graySaturation * 1.15, 1), lightness, 1));
        const resultColorString = ignoreBlueFilter ? resultColor.toString()
            : this.applyBlueFilter(resultColor).toString();
        return {
            color: resultColorString,
            role: Component.TextShadow,
            light: lightness,
            originalLight: 0.5,
            originalColor: RgbaColor.Gray,
            alpha: 1,
            reason: ColorReason.Ok,
            isUpToDate: true,
            owner: null
        };
    }
};
RangeFillColorProcessor = __decorate([
    injectable(IRangeFillColorProcessor),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], RangeFillColorProcessor);

;// CONCATENATED MODULE: ./ts/Colors/ColorToRgbaStringConverter.ts


class IColorToRgbaStringConverter {
}
let ColorToRgbaStringConverter = class ColorToRgbaStringConverter {
    constructor(_document) {
        this._document = _document;
    }
    convert(colorName) {
        let div = this._document.createElement("div");
        div.style.setProperty("display", "none", "important");
        div.style.setProperty("color", colorName, "important");
        div.mlIgnore = true;
        this._document.body.appendChild(div);
        let rgbStr = this._document.defaultView.getComputedStyle(div).color;
        this._document.body.removeChild(div);
        return rgbStr;
    }
};
ColorToRgbaStringConverter = __decorate([
    injectable(IColorToRgbaStringConverter),
    __metadata("design:paramtypes", [Document])
], ColorToRgbaStringConverter);

;// CONCATENATED MODULE: ./ts/ContentScript/DocumentZoomObserver.ts




class IDocumentZoomObserver {
}
let DocumentZoomObserver = class DocumentZoomObserver {
    constructor(doc, settingsBus, _settingsManager) {
        this._settingsManager = _settingsManager;
        this.lastZoom = 1;
        settingsBus.onZoomChanged.addListener((done, zoom) => {
            this.lastZoom = zoom || 1;
            this.setDocumentZoom(doc);
            if (window.top === window.self) {
                done(true);
            }
        }, null);
        _settingsManager.onSettingsInitialized.addListener(_ => this.setDocumentZoom(doc), this);
        _settingsManager.onSettingsChanged.addListener(_ => this.setDocumentZoom(doc), this);
    }
    get CurrentZoom() { return this.lastZoom; }
    setDocumentZoom(doc) {
        if (this._settingsManager.isActive) {
            doc.documentElement.style.setProperty("--ml-zoom", this.lastZoom.toString(), "important");
        }
    }
};
DocumentZoomObserver = __decorate([
    injectable(IDocumentZoomObserver),
    __metadata("design:paramtypes", [Document,
        ISettingsBus,
        IBaseSettingsManager])
], DocumentZoomObserver);

;// CONCATENATED MODULE: ./ts/ContentScript/SvgFilters.ts





const colorOverlayLimit = 0.12;
const svgNs = "http://www.w3.org/2000/svg", svgElementId = "midnight-lizard-filters";
class ISvgFilters {
}
var FilterType;
(function (FilterType) {
    FilterType["ContentFilter"] = "ml-content-filter";
    FilterType["BlueFilter"] = "ml-blue-filter";
    FilterType["PdfFilter"] = "pdf-bg-filter";
})(FilterType || (FilterType = {}));
let SvgFilters = class SvgFilters {
    constructor(_app, _settingsManager) {
        this._app = _app;
        this._settingsManager = _settingsManager;
    }
    removeSvgFilters(doc) {
        const svgFilters = doc.getElementById(svgElementId);
        svgFilters && svgFilters.remove();
    }
    createSvgFilters(doc, overlayBgColor, overlayTxtColor) {
        const svg = doc.createElementNS(svgNs, "svg");
        svg.id = svgElementId;
        svg.mlIgnore = true;
        svg.style.width = svg.style.height = "0";
        svg.style.position = "absolute";
        let originalPdfBgColor = new RgbaColor(82, 86, 89, 1);
        switch (this._app.browserVendor) {
            case BrowserVendor.Microsoft:
                originalPdfBgColor = new RgbaColor(51, 51, 51, 1);
                break;
        }
        const filters = [
            this.createBlueFilter(doc),
            this.createContentFilter(doc, overlayBgColor, overlayTxtColor),
            this.createColorReplacementFilter(doc, FilterType.PdfFilter, new RgbaColor(240, 240, 240, 1), originalPdfBgColor)
        ];
        for (const filter of filters) {
            filter.setAttribute("x", "0");
            filter.setAttribute("y", "0");
            filter.setAttribute("width", "99999");
            filter.setAttribute("height", "99999");
            svg.appendChild(filter);
        }
        doc.documentElement.appendChild(svg);
    }
    createBlueFilter(doc) {
        const filter = doc.createElementNS(svgNs, "filter"), feColorMatrix = doc.createElementNS(svgNs, "feColorMatrix"), blueFltr = this._settingsManager.currentSettings.blueFilter / 100, redShiftMatrix = `1 0 ${blueFltr} 0 0 0 1 0 0 0 0 0 ${1 - blueFltr} 0 0 0 0 0 1 0`;
        filter.id = FilterType.BlueFilter;
        filter.setAttribute("color-interpolation-filters", "sRGB");
        if (blueFltr > 0) {
            filter.appendChild(feColorMatrix);
            feColorMatrix.setAttribute("type", "matrix");
            feColorMatrix.setAttribute("values", redShiftMatrix);
        }
        return filter;
    }
    createContentFilter(doc, overlayBgColor, overlayTxtColor) {
        const filter = doc.createElementNS(svgNs, "filter"), feColorMatrix = doc.createElementNS(svgNs, "feColorMatrix"), blueFltr = this._settingsManager.currentSettings.blueFilter / 100, redShiftMatrix = `1 0 ${blueFltr} 0 0 0 1 0 0 0 0 0 ${1 - blueFltr} 0 0 0 0 0 1 0`;
        filter.id = FilterType.ContentFilter;
        filter.setAttribute("color-interpolation-filters", "sRGB");
        let input = "SourceGraphic";
        input = this.addColorOverlay(overlayBgColor, doc, filter, input, "bg", this._settingsManager.shift.Background.hueGravity);
        input = this.addColorOverlay(overlayTxtColor, doc, filter, input, "txt", this._settingsManager.shift.Text.hueGravity);
        if (blueFltr > 0) {
            filter.appendChild(feColorMatrix);
            feColorMatrix.setAttribute("type", "matrix");
            feColorMatrix.setAttribute("values", redShiftMatrix);
            feColorMatrix.setAttribute("in", input);
        }
        return filter;
    }
    addColorOverlay(overlayColor, doc, filter, input, layer, overlayIntensity) {
        let output = input;
        const overlayColorHsl = RgbaColor.toHslaColor(RgbaColor.parse(overlayColor));
        if (overlayColorHsl.saturation > colorOverlayLimit) {
            const isDark = overlayColorHsl.lightness < 0.5;
            const blendMode = isDark ? "lighten" : "darken";
            overlayColorHsl.lightness *= isDark ? 1.1 : 1;
            const feFlood = doc.createElementNS(svgNs, "feFlood"), feComposite = doc.createElementNS(svgNs, "feComposite"), feBlend = doc.createElementNS(svgNs, "feBlend");
            filter.appendChild(feFlood);
            feFlood.setAttribute("result", "flood_" + layer);
            feFlood.setAttribute("flood-color", overlayColorHsl.toString());
            feFlood.setAttribute("flood-opacity", (overlayIntensity / 2 + 0.5).toString());
            filter.appendChild(feComposite);
            feComposite.setAttribute("result", "flood_alpha_" + layer);
            feComposite.setAttribute("in", "flood_" + layer);
            feComposite.setAttribute("in2", "SourceAlpha");
            feComposite.setAttribute("operator", "in");
            filter.appendChild(feBlend);
            feBlend.setAttribute("result", "blend_" + layer);
            feBlend.setAttribute("in", "flood_alpha_" + layer);
            feBlend.setAttribute("in2", input);
            feBlend.setAttribute("mode", blendMode);
            output = "blend_" + layer;
        }
        return output;
    }
    createColorReplacementFilter(doc, filterId, newColor, ...originalColors) {
        const replaceColorFilter = doc.createElementNS(svgNs, "filter");
        replaceColorFilter.id = filterId;
        replaceColorFilter.setAttribute("color-interpolation-filters", "sRGB");
        const feComponentTransfer = doc.createElementNS(svgNs, "feComponentTransfer"), feFuncR = doc.createElementNS(svgNs, "feFuncR"), feFuncG = doc.createElementNS(svgNs, "feFuncG"), feFuncB = doc.createElementNS(svgNs, "feFuncB");
        feFuncR.setAttribute("type", "discrete");
        feFuncG.setAttribute("type", "discrete");
        feFuncB.setAttribute("type", "discrete");
        feFuncR.setAttribute("tableValues", this.convertColorsToComponentTransfer(...originalColors.map(x => x.red)));
        feFuncG.setAttribute("tableValues", this.convertColorsToComponentTransfer(...originalColors.map(x => x.green)));
        feFuncB.setAttribute("tableValues", this.convertColorsToComponentTransfer(...originalColors.map(x => x.blue)));
        feComponentTransfer.appendChild(feFuncR);
        feComponentTransfer.appendChild(feFuncG);
        feComponentTransfer.appendChild(feFuncB);
        replaceColorFilter.appendChild(feComponentTransfer);
        const cutColorMatrix = doc.createElementNS(svgNs, "feColorMatrix"), selectedColorLayer = "selectedColor";
        cutColorMatrix.setAttribute("result", selectedColorLayer);
        cutColorMatrix.setAttribute("type", "matrix");
        cutColorMatrix.setAttribute("values", `1 0 0 0 0
                                               0 1 0 0 0
                                               0 0 1 0 0
                                               1 1 1 1 -3`);
        replaceColorFilter.appendChild(cutColorMatrix);
        const feFlood = doc.createElementNS(svgNs, "feFlood");
        feFlood.setAttribute("flood-color", newColor.toString());
        replaceColorFilter.appendChild(feFlood);
        const feCompositeSelectedColor = doc.createElementNS(svgNs, "feComposite");
        feCompositeSelectedColor.setAttribute("operator", "in");
        feCompositeSelectedColor.setAttribute("in2", selectedColorLayer);
        replaceColorFilter.appendChild(feCompositeSelectedColor);
        const feCompositeSourceGraphic = doc.createElementNS(svgNs, "feComposite");
        feCompositeSourceGraphic.setAttribute("operator", "over");
        feCompositeSourceGraphic.setAttribute("in2", "SourceGraphic");
        replaceColorFilter.appendChild(feCompositeSourceGraphic);
        return replaceColorFilter;
    }
    convertColorsToComponentTransfer(...colorComponents) {
        const transfer = Array.apply(null, Array(256)).map(Number.prototype.valueOf, 0);
        colorComponents.forEach(c => transfer[Math.round(c)] = 1);
        return transfer.join(" ");
    }
};
SvgFilters = __decorate([
    injectable(ISvgFilters),
    __metadata("design:paramtypes", [IApplicationSettings,
        IBaseSettingsManager])
], SvgFilters);

;// CONCATENATED MODULE: ./ts/ContentScript/BackgroundImage.ts
var BackgroundImageType;
(function (BackgroundImageType) {
    BackgroundImageType[BackgroundImageType["Image"] = 0] = "Image";
    BackgroundImageType[BackgroundImageType["Gradient"] = 1] = "Gradient";
})(BackgroundImageType || (BackgroundImageType = {}));
class BackgroundImage {
    constructor(data, type) {
        this.data = data;
        this.type = type;
    }
}

;// CONCATENATED MODULE: ./ts/ContentScript/BackgroundImageProcessor.ts










class IBackgroundImageProcessor {
}
let BackgroundImageProcessor = class BackgroundImageProcessor {
    constructor(rootDoc, _app, _msgBus, _settingsManager) {
        this._app = _app;
        this._msgBus = _msgBus;
        this._settingsManager = _settingsManager;
        this._images = new Map();
        this._imagePromises = new Map();
        this._imageResolvers = new Map();
        this._imageRejectors = new Map();
        this._storagePrefix = "ml-image-";
        this._maxCacheSize = 256 * 1024 * 2;
        this._storageIsAccessable = true;
        this._imageSizeLimit = 0;
        this._hideBigImages = false;
        this._imageSizeLimitValue = -1;
        this._anchor = rootDoc.createElement("a");
        _msgBus.onMessage.addListener(this.onImageFetchMessage, this);
        _settingsManager.onSettingsInitialized.addListener(this.onSettingsInitialized, this);
        _settingsManager.onSettingsChanged.addListener(this.onSettingsChanged, this, EventHandlerPriority.High);
        try {
            let storageKey;
            for (let i = 0; storageKey = sessionStorage.key(i); i++) {
                if (storageKey.startsWith(this._storagePrefix)) {
                    const imageJson = sessionStorage.getItem(storageKey);
                    if (imageJson) {
                        this._images.set(storageKey.substr(this._storagePrefix.length), JSON.parse(imageJson));
                    }
                }
            }
        }
        catch (_a) {
            this._storageIsAccessable = false;
        }
    }
    calcImageSizeLimitValue() {
        this._imageSizeLimitValue = this._hideBigImages ? this._imageSizeLimit * 1024 : -1;
    }
    onSettingsInitialized() {
        this._hideBigImages = this._settingsManager.currentSettings.hideBigBackgroundImages;
        this._imageSizeLimit = this._settingsManager.currentSettings.maxBackgroundImageSize;
        this.calcImageSizeLimitValue();
    }
    onSettingsChanged(response, shift) {
        if (this._imageSizeLimit !== this._settingsManager.currentSettings.maxBackgroundImageSize ||
            this._hideBigImages !== this._settingsManager.currentSettings.hideBigBackgroundImages) {
            this._imagePromises.clear();
            this._imageResolvers.clear();
            this._imageRejectors.clear();
        }
        this._images.clear();
        this._imageSizeLimit = this._settingsManager.currentSettings.maxBackgroundImageSize;
        this._hideBigImages = this._settingsManager.currentSettings.hideBigBackgroundImages;
        this.calcImageSizeLimitValue();
    }
    onImageFetchMessage(message) {
        if (message) {
            switch (message.type) {
                case MessageType.ImageFetchCompleted:
                    const resolve = this._imageResolvers.get(message.url + this._imageSizeLimit);
                    resolve && resolve(message.img);
                    break;
                case MessageType.ImageFetchFailed:
                    const reject = this._imageRejectors.get(message.url + this._imageSizeLimit);
                    reject && reject(message.error);
                    this._imageRejectors.delete(message.url + this._imageSizeLimit);
                    this._imageResolvers.delete(message.url + this._imageSizeLimit);
                    break;
                case MessageType.ErrorMessage:
                    if (this._app.isDebug) {
                        console.log(message);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    save(url, img) {
        this._images.set(url + this._imageSizeLimit, img);
        this._imagePromises.delete(url + this._imageSizeLimit);
        if (this._storageIsAccessable && img.d.length < this._maxCacheSize) {
            try {
                sessionStorage.setItem(this._storagePrefix + url + this._imageSizeLimit, JSON.stringify(img));
            }
            catch (ex) {
                this._storageIsAccessable = false;
                if (this._app.isDebug) {
                    console.error(ex);
                }
            }
        }
    }
    process(url, bgFilter, blueFilter, roomRules) {
        url = this.getAbsoluteUrl(trim(url.substr(3), "()'\""));
        const bgFltr = bgFilter.replace(`var(--${FilterType.BlueFilter})`, `url(#${FilterType.BlueFilter})`);
        const prevImage = this._images.get(url + this._imageSizeLimit);
        if (prevImage) {
            return this.createBackgroundImage(prevImage, bgFltr, blueFilter);
        }
        roomRules.hasBackgroundImagePromises = true;
        let cachePromise = this._imagePromises.get(url + this._imageSizeLimit) || this.fetchNewImage(url);
        let result = Promise.all([url, cachePromise, bgFltr, blueFilter])
            .then(([_url, img, fltr, blueFltr]) => {
            this.save(_url, img);
            return this.createBackgroundImage(img, fltr, blueFltr);
        });
        return result;
    }
    fetchNewImage(url) {
        let cachePromise = new Promise((resolve, reject) => {
            this._imageResolvers.set(url + this._imageSizeLimit, resolve);
            this._imageRejectors.set(url + this._imageSizeLimit, reject);
            this._msgBus.postMessage(new FetchImage(url, this._imageSizeLimitValue));
        });
        this._imagePromises.set(url + this._imageSizeLimit, cachePromise);
        return cachePromise;
    }
    createBackgroundImage(img, filters, blueFilter) {
        const svgImg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.w}" height="${img.h}" filter="${filters}">` +
            (blueFilter ?
                `<filter id="${FilterType.BlueFilter}"><feColorMatrix type="matrix" values="` +
                    `1 0 ${blueFilter} 0 0 0 1 0 0 0 0 0 ${1 - blueFilter} 0 0 0 0 0 1 0"/></filter>` : "") +
            `<image width="${img.w}" height="${img.h}" href="${img.d}"/></svg>`;
        return new BackgroundImage("url('data:image/svg+xml," + encodeURIComponent(svgImg)
            .replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29") +
            "')", BackgroundImageType.Image);
    }
    getAbsoluteUrl(relativeUrl) {
        this._anchor.href = relativeUrl;
        return this._anchor.href;
    }
};
BackgroundImageProcessor = __decorate([
    injectable(IBackgroundImageProcessor),
    __metadata("design:paramtypes", [Document,
        IApplicationSettings,
        IContentMessageBus,
        IBaseSettingsManager])
], BackgroundImageProcessor);

;// CONCATENATED MODULE: ./ts/Colors/NoneColorProcessor.ts





class INoneColorProcessor {
}
let NoneColorProcessor = class NoneColorProcessor {
    changeColor(rgbaString) {
        rgbaString = !rgbaString || rgbaString === "none" ? RgbaColor.Transparent : rgbaString;
        const rgba = RgbaColor.parse(rgbaString);
        const hsla = RgbaColor.toHslaColor(rgba);
        return {
            role: Component.None,
            color: rgbaString,
            light: hsla.lightness,
            originalLight: hsla.lightness,
            originalColor: rgbaString,
            alpha: rgba.alpha,
            reason: ColorReason.None,
            isUpToDate: true,
            owner: null
        };
    }
};
NoneColorProcessor = __decorate([
    injectable(INoneColorProcessor)
], NoneColorProcessor);

;// CONCATENATED MODULE: ./ts/ContentScript/ProcessingOrder.ts
var ProcessingOrder;
(function (ProcessingOrder) {
    ProcessingOrder[ProcessingOrder["viewColorTags"] = 0] = "viewColorTags";
    ProcessingOrder[ProcessingOrder["visColorTags"] = 1] = "visColorTags";
    ProcessingOrder[ProcessingOrder["viewImageTags"] = 2] = "viewImageTags";
    ProcessingOrder[ProcessingOrder["viewLinks"] = 3] = "viewLinks";
    ProcessingOrder[ProcessingOrder["viewBgImageTags"] = 4] = "viewBgImageTags";
    ProcessingOrder[ProcessingOrder["viewTransTags"] = 5] = "viewTransTags";
    ProcessingOrder[ProcessingOrder["visImageTags"] = 6] = "visImageTags";
    ProcessingOrder[ProcessingOrder["visLinks"] = 7] = "visLinks";
    ProcessingOrder[ProcessingOrder["visTransTags"] = 8] = "visTransTags";
    ProcessingOrder[ProcessingOrder["visBgImageTags"] = 9] = "visBgImageTags";
    ProcessingOrder[ProcessingOrder["invisColorTags"] = 10] = "invisColorTags";
    ProcessingOrder[ProcessingOrder["invisImageTags"] = 11] = "invisImageTags";
    ProcessingOrder[ProcessingOrder["invisTransTags"] = 12] = "invisTransTags";
    ProcessingOrder[ProcessingOrder["invisLinks"] = 13] = "invisLinks";
    ProcessingOrder[ProcessingOrder["invisBgImageTags"] = 14] = "invisBgImageTags";
    ProcessingOrder[ProcessingOrder["delayedInvisTags"] = 15] = "delayedInvisTags";
})(ProcessingOrder || (ProcessingOrder = {}));
const normalDelays = new Map([
    [ProcessingOrder.viewColorTags, 0],
    [ProcessingOrder.visColorTags, 1],
    [ProcessingOrder.viewImageTags, 5],
    [ProcessingOrder.viewLinks, 10],
    [ProcessingOrder.viewBgImageTags, 25],
    [ProcessingOrder.viewTransTags, 75],
    [ProcessingOrder.visImageTags, 125],
    [ProcessingOrder.visLinks, 175],
    [ProcessingOrder.visTransTags, 250],
    [ProcessingOrder.visBgImageTags, 400],
    [ProcessingOrder.invisColorTags, 750],
    [ProcessingOrder.invisImageTags, 1100],
    [ProcessingOrder.invisTransTags, 1450],
    [ProcessingOrder.invisLinks, 1750],
    [ProcessingOrder.invisBgImageTags, 2250],
    [ProcessingOrder.delayedInvisTags, 2500]
]);
const bigReCalculationDelays = new Map([
    [ProcessingOrder.viewColorTags, 0],
    [ProcessingOrder.visColorTags, 1],
    [ProcessingOrder.viewImageTags, 3],
    [ProcessingOrder.viewLinks, 5],
    [ProcessingOrder.viewBgImageTags, 10],
    [ProcessingOrder.viewTransTags, 20],
    [ProcessingOrder.visImageTags, 30],
    [ProcessingOrder.visLinks, 50],
    [ProcessingOrder.visTransTags, 75],
    [ProcessingOrder.visBgImageTags, 100],
    [ProcessingOrder.invisColorTags, 140],
    [ProcessingOrder.invisImageTags, 175],
    [ProcessingOrder.invisTransTags, 210],
    [ProcessingOrder.invisLinks, 250],
    [ProcessingOrder.invisBgImageTags, 300],
    [ProcessingOrder.delayedInvisTags, 350]
]);
const smallReCalculationDelays = new Map([
    [ProcessingOrder.viewColorTags, 0],
    [ProcessingOrder.visColorTags, 0],
    [ProcessingOrder.viewImageTags, 0],
    [ProcessingOrder.viewLinks, 0],
    [ProcessingOrder.viewBgImageTags, 0],
    [ProcessingOrder.viewTransTags, 0],
    [ProcessingOrder.visImageTags, 0],
    [ProcessingOrder.visLinks, 0],
    [ProcessingOrder.visTransTags, 0],
    [ProcessingOrder.visBgImageTags, 0],
    [ProcessingOrder.invisColorTags, 1],
    [ProcessingOrder.invisImageTags, 1],
    [ProcessingOrder.invisTransTags, 1],
    [ProcessingOrder.invisLinks, 1],
    [ProcessingOrder.invisBgImageTags, 1],
    [ProcessingOrder.delayedInvisTags, 100]
]);
const onCopyReCalculationDelays = new Map(bigReCalculationDelays);
onCopyReCalculationDelays.set(ProcessingOrder.viewColorTags, 1);

;// CONCATENATED MODULE: ./ts/ContentScript/DocumentProcessor.ts
var DocumentProcessor_1;
































let chunkLength = 300;
let minChunkableLength = 700;
const DocumentProcessor_dom = HtmlEvent_HtmlEvent;
const cx = RgbaColor;
const cc = Component;
const po = ProcessingOrder;
const Status = PromiseStatus;
const DocumentProcessor_ArgEventDispatcher = ArgumentedEventDispatcher;
const doNotInvertRegExp = /user|account|avatar|photo(?!.+black)|white|grey(?!_medium.svg|_dark.svg)|gray|flag|emoji/i;
const notTextureRegExp = /user|account|avatar|photo|flag|emoji/i;
const smallRoles = /button|checkbox|columnheader|combobox|gridcell|link|listitem|menuitem|menuitemcheckbox|menuitemradio|option|radio|separator|search|textbox|tooltip|treeitem/i;
const DocumentProcessor_float = new Intl.NumberFormat('en-US', {
    useGrouping: false,
    maximumFractionDigits: 2
});
var ProcessingStage;
(function (ProcessingStage) {
    ProcessingStage["None"] = "none";
    ProcessingStage["Preload"] = "preload";
    ProcessingStage["Loading"] = "loading";
    ProcessingStage["Complete"] = "complete";
})(ProcessingStage || (ProcessingStage = {}));
var UpdateStage;
(function (UpdateStage) {
    UpdateStage["Aware"] = "aware";
    UpdateStage["Requested"] = "requested";
    UpdateStage["Ready"] = "ready";
})(UpdateStage || (UpdateStage = {}));
class IDocumentProcessor {
}
let DocumentProcessor = DocumentProcessor_1 = class DocumentProcessor {
    constructor(css, _rootDocument, _module, _app, _settingsManager, _preloadManager, _documentObserver, _styleSheetProcessor, _backgroundColorProcessor, _buttonBackgroundColorProcessor, _svgColorProcessor, _scrollbarHoverColorProcessor, _scrollbarNormalColorProcessor, _scrollbarActiveColorProcessor, _textColorProcessor, _textSelectionColorProcessor, _highlightedTextColorProcessor, _highlightedBackgroundColorProcessor, _linkColorProcessor, _visitedLinkColorProcessor, _activeVisitedLinkColorProcessor, _hoverVisitedLinkColorProcessor, _activeLinkColorProcessor, _hoverLinkColorProcessor, _textShadowColorProcessor, _rangeFillColorProcessor, _borderColorProcessor, _buttonBorderColorProcessor, _colorConverter, _zoomObserver, _svgFilters, _backgroundImageProcessor, _noneColorProcessor) {
        this._rootDocument = _rootDocument;
        this._module = _module;
        this._app = _app;
        this._settingsManager = _settingsManager;
        this._preloadManager = _preloadManager;
        this._documentObserver = _documentObserver;
        this._styleSheetProcessor = _styleSheetProcessor;
        this._backgroundColorProcessor = _backgroundColorProcessor;
        this._buttonBackgroundColorProcessor = _buttonBackgroundColorProcessor;
        this._svgColorProcessor = _svgColorProcessor;
        this._scrollbarHoverColorProcessor = _scrollbarHoverColorProcessor;
        this._scrollbarNormalColorProcessor = _scrollbarNormalColorProcessor;
        this._scrollbarActiveColorProcessor = _scrollbarActiveColorProcessor;
        this._textColorProcessor = _textColorProcessor;
        this._textSelectionColorProcessor = _textSelectionColorProcessor;
        this._highlightedTextColorProcessor = _highlightedTextColorProcessor;
        this._highlightedBackgroundColorProcessor = _highlightedBackgroundColorProcessor;
        this._linkColorProcessor = _linkColorProcessor;
        this._visitedLinkColorProcessor = _visitedLinkColorProcessor;
        this._activeVisitedLinkColorProcessor = _activeVisitedLinkColorProcessor;
        this._hoverVisitedLinkColorProcessor = _hoverVisitedLinkColorProcessor;
        this._activeLinkColorProcessor = _activeLinkColorProcessor;
        this._hoverLinkColorProcessor = _hoverLinkColorProcessor;
        this._textShadowColorProcessor = _textShadowColorProcessor;
        this._rangeFillColorProcessor = _rangeFillColorProcessor;
        this._borderColorProcessor = _borderColorProcessor;
        this._buttonBorderColorProcessor = _buttonBorderColorProcessor;
        this._colorConverter = _colorConverter;
        this._zoomObserver = _zoomObserver;
        this._svgFilters = _svgFilters;
        this._backgroundImageProcessor = _backgroundImageProcessor;
        this._noneColorProcessor = _noneColorProcessor;
        this._rootDocumentContentLoaded = false;
        this._standardPseudoCssTexts = new Map();
        this._pseudoStyles = new Map();
        this._filterForFilterProcessing = this.getFilterOfElementsForFilterProcessing();
        this._onRootDocumentProcessing = new DocumentProcessor_ArgEventDispatcher();
        this._onMainColorsCalculated = new DocumentProcessor_ArgEventDispatcher();
        if (_module.name === ExtensionModule.PopupWindow) {
            chunkLength = 250;
            minChunkableLength = 600;
            normalDelays.set(ProcessingOrder.delayedInvisTags, 1000);
        }
        this._rootImageUrl = `url("${_rootDocument.location.href}")`;
        this._css = css;
        this._transitionForbiddenProperties = new Set([
            this._css.all,
            this._css.background,
            this._css.backgroundColor,
            this._css.backgroundImage,
            this._css.color,
            this._css.border,
            this._css.borderBottom,
            this._css.borderBottomColor,
            this._css.borderColor,
            this._css.borderLeft,
            this._css.borderLeftColor,
            this._css.borderRight,
            this._css.borderRightColor,
            this._css.borderTop,
            this._css.borderTopColor,
            this._css.textShadow,
            this._css.filter
        ]);
        this._boundUserActionHandler = this.onUserAction.bind(this);
        this._boundCheckedLabelHandler = this.onLabelChecked.bind(this);
        this._boundUserHoverHandler = this.onUserHover.bind(this);
        this._boundParentBackgroundGetter = this.getParentBackground.bind(this);
        if (this.setDocumentProcessingStage(_rootDocument, ProcessingStage.Preload)) {
            this.addListeners();
        }
        this._documentObserver.startDocumentUpdateObservation(_rootDocument);
        this._documentObserver.onUpdateChanged.addListener(this.onDocumentUpdateStageChanged, this);
    }
    get shift() { return this._settingsManager.shift; }
    get onRootDocumentProcessing() {
        return this._onRootDocumentProcessing.event;
    }
    get onMainColorsCalculated() {
        return this._onMainColorsCalculated.event;
    }
    addListeners() {
        DocumentProcessor_dom.addEventListener(this._rootDocument, "DOMContentLoaded", this.onDocumentContentLoaded, this);
        this._settingsManager.onSettingsInitialized.addListener(this.onSettingsInitialized, this);
        this._settingsManager.onSettingsChanged.addListener(this.onSettingsChanged, this, EventHandlerPriority.Low);
        this._documentObserver.onElementsAdded.addListener(this.onElementsAdded, this);
        this._documentObserver.onClassChanged.addListener(this.onClassChanged, this);
        this._documentObserver.onStyleChanged.addListener(this.onStyleChanged, this);
        this._styleSheetProcessor.onElementsForUserActionObservationFound
            .addListener(this.onElementsForUserActionObservationFound, this);
    }
    createStandardPseudoCssTexts() {
        const invertedBackgroundImageFilter = [
            this.shift.BackgroundImage.saturationLimit < 1 ? `saturate(${this.shift.BackgroundImage.saturationLimit})` : "",
            `brightness(${DocumentProcessor_float.format(1 - this.shift.Background.lightnessLimit)}) hue-rotate(180deg) invert(1)`,
            this._settingsManager.currentSettings.blueFilter !== 0 ? `var(--${FilterType.BlueFilter})` : ""
        ].filter(f => f).join(" ").trim(), backgroundImageFilter = [
            this.shift.BackgroundImage.saturationLimit < 1 ? `saturate(${this.shift.BackgroundImage.saturationLimit})` : "",
            this.shift.BackgroundImage.lightnessLimit < 1 ? `brightness(${this.shift.BackgroundImage.lightnessLimit})` : "",
            this._settingsManager.currentSettings.blueFilter !== 0 ? `var(--${FilterType.BlueFilter})` : ""
        ].filter(f => f).join(" ").trim();
        this._standardPseudoCssTexts.set(PseudoStyleStandard.InvertedBackgroundImage, `${this._css.filter}:${invertedBackgroundImageFilter}!${this._css.important}`);
        this._standardPseudoCssTexts.set(PseudoStyleStandard.BackgroundImage, `${this._css.filter}:${backgroundImageFilter}!${this._css.important}`);
    }
    onSettingsChanged(response, shift) {
        this.createStandardPseudoCssTexts();
        this.restoreDocumentColors(this._rootDocument);
        if (this._settingsManager.isActive) {
            this.injectDynamicValues(this._rootDocument);
            this.processRootDocument();
        }
        if (window.top === window.self) {
            response(this._settingsManager.currentSettings);
        }
    }
    onSettingsInitialized() {
        if (this._settingsManager.isActive) {
            this.createStandardPseudoCssTexts();
            this.injectDynamicValues(this._rootDocument);
            if (this._rootDocumentContentLoaded || this._rootDocument.readyState === "complete") {
                this._rootDocumentContentLoaded = true;
                this.processRootDocument();
            }
            else {
                this.setDocumentProcessingStage(this._rootDocument, this._settingsManager.isActive
                    ? ProcessingStage.Loading
                    : ProcessingStage.None);
            }
        }
        else {
            this.setDocumentProcessingStage(this._rootDocument, ProcessingStage.None);
        }
    }
    onDocumentUpdateStageChanged(html) {
        switch (html.getAttribute("ml-update")) {
            case UpdateStage.Requested:
                this._settingsManager.deactivateOldVersion();
                this.restoreDocumentColors(html.ownerDocument);
                html.setAttribute("ml-update", UpdateStage.Ready);
                break;
            case UpdateStage.Ready:
                this._autoUpdateTask && clearTimeout(this._autoUpdateTask);
                this.addListeners();
                this.onSettingsInitialized();
                break;
            default:
                break;
        }
    }
    onDocumentContentLoaded() {
        DocumentProcessor_dom.removeEventListener(this._rootDocument, "DOMContentLoaded", this.onDocumentContentLoaded);
        if (!this._rootDocumentContentLoaded) {
            this._rootDocumentContentLoaded = true;
            if (this._settingsManager.isActive) {
                this.processRootDocument();
            }
        }
    }
    setDocumentProcessingStage(doc, stage) {
        const html = doc.documentElement;
        if (stage === ProcessingStage.None) {
            html.removeAttribute("ml-stage");
            html.removeAttribute("ml-mode");
            html.removeAttribute("ml-stage-mode");
            html.removeAttribute("ml-platform");
            html.removeAttribute("ml-scrollbar-style");
            html.removeAttribute("ml-invert");
            html.removeAttribute("ml-view");
            html.removeAttribute("ml-embed");
            html.removeAttribute("ml-image");
        }
        else {
            if (stage === ProcessingStage.Preload &&
                html.getAttribute("ml-stage") === ProcessingStage.Complete) {
                if (html.hasAttribute("ml-update") &&
                    this._app.browserName !== BrowserName.Firefox) {
                    html.setAttribute("ml-update", UpdateStage.Requested);
                }
                else {
                    this._settingsManager.onSettingsChanged.addListener((response, shift) => {
                        throw new Error("Midnight Lizard has been updated. Please refresh the page.");
                    }, this);
                }
                return false;
            }
            else {
                html.setAttribute("ml-update", UpdateStage.Aware);
                html.setAttribute("ml-stage", stage);
                html.setAttribute("ml-view", window.top === window.self ? "top" : "child");
                if (this._settingsManager.isActive) {
                    if (this._rootDocument.body && this._rootDocument.body.childElementCount === 1) {
                        if (this._rootDocument.body.firstElementChild instanceof HTMLEmbedElement) {
                            html.setAttribute("ml-embed", "");
                        }
                        else if (this._rootDocument.body.firstElementChild instanceof HTMLImageElement) {
                            html.setAttribute("ml-image", "");
                        }
                    }
                    html.setAttribute("ml-platform", this._app.isDesktop ? "desktop" : "mobile");
                    if (this.shift.Background.lightnessLimit < 0.3) {
                        html.setAttribute("ml-invert", "");
                    }
                    html.setAttribute("ml-scrollbar-style", this._settingsManager.currentSettings.scrollbarStyle ? "ml-simple" : "original");
                    html.setAttribute("ml-mode", this._settingsManager.computedMode);
                    html.setAttribute("ml-stage-mode", stage + "-" + this._settingsManager.computedMode);
                }
            }
        }
        return true;
    }
    getLastDoccumentProcessingMode(doc) {
        return doc.documentElement.getAttribute("ml-mode") || ProcessingMode.Complex;
    }
    processRootDocument() {
        this._onRootDocumentProcessing.raise(this._rootDocument);
        this.processDocument(this._rootDocument);
    }
    processDocument(doc) {
        if (doc.body && doc.defaultView && this._settingsManager.isActive) {
            doc.mlTimestamp = Date.now();
            doc.viewArea = doc.defaultView.innerHeight * doc.defaultView.innerWidth;
            this._settingsManager.computeProcessingMode(doc);
            this.processMetaTheme(doc);
            this.setDocumentProcessingStage(doc, ProcessingStage.Complete);
            if (this._settingsManager.isComplex) {
                this._styleSheetProcessor.processDocumentStyleSheets(doc);
                if (this._settingsManager.currentSettings.restoreColorsOnCopy) {
                    DocumentProcessor_dom.addEventListener(doc, "copy", this.onCopy, this, false, doc);
                }
                this.processEditableContent(doc);
                if (this._settingsManager.currentSettings.restoreColorsOnPrint) {
                    const printMedia = doc.defaultView.matchMedia("print");
                    printMedia.addListener(mql => {
                        if (this._settingsManager.currentSettings.restoreColorsOnPrint) {
                            if (mql.matches) {
                                this.restoreDocumentColors(doc);
                            }
                            else {
                                this.injectDynamicValues(doc);
                                this.processDocument(doc);
                            }
                        }
                    });
                }
                this.createPseudoStyles(doc);
                this.createPageScript(doc);
                this.calculateDefaultColors(doc);
                this._documentObserver.startDocumentObservation(doc);
                let allTags = Array.from(doc.body.getElementsByTagName("*"))
                    .concat([doc.body, doc.documentElement])
                    .filter(this.getFilterOfElementsForComplexProcessing());
                DocumentProcessor_1.processAllElements(allTags, this, normalDelays, true, false);
            }
            else if (this._settingsManager.isSimple && this._settingsManager.shouldObserve()) {
                this._documentObserver.startDocumentObservation(doc);
                let allTags = Array.from(doc.body.getElementsByTagName("*"))
                    .filter(this.getFilterOfElementsForComplexProcessing());
                DocumentProcessor_1.processAllElements(allTags, this, smallReCalculationDelays);
            }
            else if (this._settingsManager.isFilter && this.shift.Background.lightnessLimit < 0.3
                && this._settingsManager.shouldObserve()) {
                this._documentObserver.startDocumentObservation(doc);
                let allTags = Array.from(doc.body.getElementsByTagName("*"))
                    .filter(this.getFilterOfElementsForFilterProcessing());
                DocumentProcessor_1.processAllElements(allTags, this, smallReCalculationDelays);
            }
        }
        else {
            this.setDocumentProcessingStage(this._rootDocument, ProcessingStage.None);
        }
    }
    processEditableContent(doc) {
        DocumentProcessor_dom.addEventListener(doc.documentElement, "before-get-inner-html", (e) => {
            const rootElement = e.target;
            if (rootElement && this._settingsManager.isActive && this._settingsManager.isComplex) {
                const state = this._documentObserver.stopDocumentObservation(doc);
                const allElements = Array.from(rootElement.getElementsByTagName("*"));
                allElements.splice(0, 0, rootElement);
                allElements.forEach(tag => {
                    tag.isEditableContent = true;
                    this.restoreElementColors(tag);
                });
                rootElement.originalColor = rootElement.style.color;
                rootElement.style.setProperty(this._css.color, cx.Black, this._css.important);
                DocumentProcessor_dom.addEventListener(rootElement, "after-get-inner-html", (e) => {
                    DocumentProcessor_dom.removeAllEventListeners(rootElement, "after-get-inner-html");
                    rootElement.style.setProperty(this._css.color, rootElement.originalColor || "");
                    DocumentProcessor_1.processAllElements(allElements, this, smallReCalculationDelays);
                });
                this._documentObserver.startDocumentObservation(doc, state);
            }
        });
    }
    getFilterOfElementsForComplexProcessing() {
        return (tag) => this.checkElement(tag) && (!!tag.parentElement || tag === tag.ownerDocument.documentElement);
    }
    getFilterOfElementsForFilterProcessing() {
        return (tag) => {
            if (this.checkElement(tag) && (!!tag.parentElement || tag === tag.ownerDocument.documentElement) &&
                !(tag instanceof HTMLOptionElement)) {
                tag.mlComputedStyle = tag.mlComputedStyle || tag.ownerDocument.defaultView.getComputedStyle(tag, "");
                if (this._backgroundColorProcessor.isDark(tag.mlComputedStyle.backgroundColor)) {
                    tag.mlInvert = true;
                }
                return tag.mlComputedStyle.filter === this._css.none && !!tag.mlInvert;
            }
            return false;
        };
    }
    getFilterOfElementsForSimplifiedProcessing() {
        return (tag) => {
            if (this.checkElement(tag) && (!!tag.parentElement || tag === tag.ownerDocument.documentElement)) {
                if (tag instanceof HTMLCanvasElement ||
                    tag instanceof HTMLEmbedElement && tag.getAttribute("type") === "application/pdf") {
                    return true;
                }
                tag.mlComputedStyle = tag.mlComputedStyle || tag.ownerDocument.defaultView.getComputedStyle(tag, "");
                return tag.mlComputedStyle.backgroundImage !== this._css.none;
            }
            return false;
        };
    }
    calculateDefaultColors(doc, defaultLinkColor, defaultTextColor) {
        if (!defaultLinkColor) {
            const aWithoutClass = doc.body.querySelector("a:not([class])");
            if (aWithoutClass) {
                defaultLinkColor = doc.defaultView.getComputedStyle(aWithoutClass).color;
            }
        }
        if (!defaultTextColor) {
            defaultTextColor = doc.defaultView.getComputedStyle(doc.body).color;
        }
        defaultLinkColor = this._linkColorProcessor.calculateDefaultColor(doc, defaultLinkColor);
        this._visitedLinkColorProcessor.calculateDefaultColor(doc, defaultLinkColor);
        this._activeLinkColorProcessor.calculateDefaultColor(doc, defaultLinkColor);
        this._hoverLinkColorProcessor.calculateDefaultColor(doc, defaultLinkColor);
        this._activeVisitedLinkColorProcessor.calculateDefaultColor(doc, defaultLinkColor);
        this._hoverVisitedLinkColorProcessor.calculateDefaultColor(doc, defaultLinkColor);
        this._textColorProcessor.calculateDefaultColor(doc, defaultTextColor);
    }
    hasPseudoClassOverrided(tag, pseudo) {
        return !!tag.mlComputedStyle && tag.mlComputedStyle.getPropertyValue(`--ml-pseudo-${PseudoClass[pseudo].toLowerCase()}`) === true.toString();
    }
    onElementsForUserActionObservationFound([pseudoClass, tags]) {
        Array.prototype.forEach.call(tags, (tag) => {
            if (tag instanceof Element) {
                tag.isObserved = true;
                tag.alwaysRecalculateStyles = true;
                switch (pseudoClass) {
                    case PseudoClass.Active:
                        DocumentProcessor_dom.addEventListener(tag, "mousedown", this._boundUserActionHandler);
                        DocumentProcessor_dom.addEventListener(tag, "mouseup", this._boundUserActionHandler);
                        break;
                    case PseudoClass.Checked:
                        this.observeCheckedUserAction(tag);
                        break;
                    case PseudoClass.Focus:
                        DocumentProcessor_dom.addEventListener(tag, "focus", this._boundUserActionHandler);
                        DocumentProcessor_dom.addEventListener(tag, "blur", this._boundUserActionHandler);
                        break;
                    case PseudoClass.Hover:
                        DocumentProcessor_dom.addEventListener(tag, "mouseenter", this._boundUserHoverHandler);
                        DocumentProcessor_dom.addEventListener(tag, "mouseleave", this._boundUserHoverHandler);
                        break;
                }
            }
        });
    }
    observeUserActions(tag) {
        let hover = false, focus = false, active = false, checked = false;
        tag.isObserved = true;
        const preFilteredSelectors = this._styleSheetProcessor.getPreFilteredSelectors(tag);
        if (preFilteredSelectors.length > 0) {
            hover = hover || this._styleSheetProcessor.canHavePseudoClass(tag, preFilteredSelectors, PseudoClass.Hover);
            focus = focus || this._styleSheetProcessor.canHavePseudoClass(tag, preFilteredSelectors, PseudoClass.Focus);
            active = active || this._styleSheetProcessor.canHavePseudoClass(tag, preFilteredSelectors, PseudoClass.Active);
            checked = checked || this._styleSheetProcessor.canHavePseudoClass(tag, preFilteredSelectors, PseudoClass.Checked);
        }
        if (hover) {
            DocumentProcessor_dom.addEventListener(tag, "mouseenter", this._boundUserHoverHandler);
            DocumentProcessor_dom.addEventListener(tag, "mouseleave", this._boundUserHoverHandler);
        }
        if (focus) {
            DocumentProcessor_dom.addEventListener(tag, "focus", this._boundUserActionHandler);
            DocumentProcessor_dom.addEventListener(tag, "blur", this._boundUserActionHandler);
        }
        if (active) {
            DocumentProcessor_dom.addEventListener(tag, "mousedown", this._boundUserActionHandler);
            DocumentProcessor_dom.addEventListener(tag, "mouseup", this._boundUserActionHandler);
        }
        if (checked) {
            this.observeCheckedUserAction(tag);
        }
    }
    observeCheckedUserAction(tag) {
        if (tag instanceof HTMLInputElement) {
            DocumentProcessor_dom.addEventListener(tag, "input", this._boundUserActionHandler);
            DocumentProcessor_dom.addEventListener(tag, "change", this._boundUserActionHandler);
        }
        else if (tag instanceof HTMLLabelElement && tag.htmlFor) {
            const checkBox = tag.ownerDocument.getElementById(tag.htmlFor);
            if (checkBox) {
                checkBox.labelElement = tag;
                DocumentProcessor_dom.addEventListener(checkBox, "input", this._boundCheckedLabelHandler);
                DocumentProcessor_dom.addEventListener(checkBox, "change", this._boundCheckedLabelHandler);
            }
        }
    }
    onLabelChecked(eArg) {
        const labelElement = eArg.currentTarget.labelElement;
        if (labelElement) {
            this.onUserAction({ currentTarget: labelElement });
        }
    }
    onUserHover(eArg) {
        if (this._settingsManager.isActive && this._settingsManager.isComplex) {
            const tag = eArg.currentTarget;
            const eventTargets = tag instanceof HTMLTableCellElement
                ? Array.from(tag.parentElement.children) : [tag];
            this.reCalcAllRootElements(new Set(eventTargets.filter(target => (target.alwaysRecalculateStyles ||
                target.mlSelectors !== this._styleSheetProcessor
                    .getElementMatchedSelectors(target)))), false);
        }
    }
    onUserAction(eArg) {
        const target = eArg.currentTarget;
        if (this._settingsManager.isActive && this._settingsManager.isComplex &&
            (target.alwaysRecalculateStyles ||
                target.mlSelectors !== this._styleSheetProcessor
                    .getElementMatchedSelectors(target))) {
            this.reCalcAllRootElements(new Set([target]), false);
        }
    }
    onCopy(doc) {
        let sel = doc.defaultView.getSelection();
        if (sel && !sel.isCollapsed) {
            let rootElem = sel.getRangeAt(0).commonAncestorContainer;
            rootElem.mlBgColor = null;
            if (this.checkElement(rootElem) === false) {
                rootElem = rootElem.parentElement || rootElem;
            }
            rootElem = this.getColoredParent(rootElem, true, true);
            this.reCalcAllRootElements(new Set([rootElem]), true);
        }
    }
    reCalcAllRootElements(rootElements, andAllChildren, skipSelectors = false) {
        if (rootElements && rootElements.size) {
            const allElements = Array.from(rootElements)
                .reduce((allElems, rootElement) => allElems.concat(this
                .reCalcRootElement(rootElement, andAllChildren, skipSelectors)), new Array());
            if (allElements.length) {
                this._documentObserver.stopDocumentObservation(allElements[0].ownerDocument);
                allElements.forEach(tag => this.restoreElementColors(tag, true));
                this._documentObserver.startDocumentObservation(allElements[0].ownerDocument);
                DocumentProcessor_1.processAllElements(allElements, this, andAllChildren ? onCopyReCalculationDelays :
                    allElements.length < 50 ? smallReCalculationDelays :
                        bigReCalculationDelays, true, false);
            }
        }
    }
    reCalcRootElement(rootElem, andAllChildren, skipSelectors = false) {
        if (rootElem && (rootElem.mlBgColor || rootElem.mlInvert) &&
            (!rootElem.mlTimestamp || Date.now() - rootElem.mlTimestamp > 1)) {
            rootElem.mlTimestamp = Date.now();
            let allTags = rootElem.firstElementChild
                ? Array.from(rootElem.getElementsByTagName("*")) : null;
            if (allTags && allTags.length > 0) {
                skipSelectors = skipSelectors || !this._settingsManager.isComplex || andAllChildren ||
                    (this._styleSheetProcessor.getSelectorsQuality(rootElem.ownerDocument) === 0) ||
                    allTags.length > chunkLength;
                let filteredTags = allTags.filter(el => {
                    if (!el.mlBgColor)
                        return false;
                    if (!skipSelectors) {
                        const newSelectors = this._styleSheetProcessor.getElementMatchedSelectors(el);
                        if (el.mlSelectors !== newSelectors) {
                            el.mlSelectors = newSelectors;
                            return true;
                        }
                        else
                            return false;
                    }
                    return true;
                });
                if (filteredTags.length < 100 || andAllChildren || this._settingsManager.isSimple) {
                    allTags.forEach(tag => {
                        tag.mlParentBgColor = null;
                        if (tag.mlBgColor && (tag.mlBgColor.color === null)) {
                            tag.mlBgColor.isUpToDate = false;
                        }
                    });
                    filteredTags.splice(0, 0, rootElem);
                    return filteredTags;
                }
                else
                    return [rootElem];
            }
            else
                return [rootElem];
        }
        return [];
    }
    onStyleChanged(changedElements) {
        let elementsForReCalculation = new Set();
        changedElements.forEach(tag => {
            let needReCalculation = !!tag.mlVisualAttributeChanged, value;
            const ns = tag instanceof SVGElement ? USP.svg : USP.htm;
            value = tag.style.getPropertyValue(ns.css.bgrColor);
            if (value && tag.style.getPropertyPriority(ns.css.bgrColor) !== this._css.important ||
                tag.mlBgColor && tag.mlBgColor.color && tag.mlBgColor.color !== value) {
                tag.originalBackgroundColor = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(ns.css.fntColor);
            if (value && tag.style.getPropertyPriority(ns.css.fntColor) !== this._css.important ||
                tag.mlColor && tag.mlColor.color && tag.mlColor.color !== value) {
                tag.originalColor = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(this._css.textShadow);
            if (value && tag.style.getPropertyPriority(this._css.textShadow) !== this._css.important) {
                tag.originalTextShadow = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(ns.css.brdColor);
            if (value && tag.style.getPropertyPriority(ns.css.brdColor) !== this._css.important) {
                tag.originalBorderColor = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(this._css.borderTopColor);
            if (value && tag.style.getPropertyPriority(this._css.borderTopColor) !== this._css.important) {
                tag.originalBorderTopColor = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(this._css.borderRightColor);
            if (value && tag.style.getPropertyPriority(this._css.borderRightColor) !== this._css.important) {
                tag.originalBorderRightColor = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(this._css.borderBottomColor);
            if (value && tag.style.getPropertyPriority(this._css.borderBottomColor) !== this._css.important) {
                tag.originalBorderBottomColor = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(this._css.borderLeftColor);
            if (value && tag.style.getPropertyPriority(this._css.borderLeftColor) !== this._css.important) {
                tag.originalBorderLeftColor = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(this._css.backgroundImage);
            if (value && tag.style.getPropertyPriority(this._css.backgroundImage) !== this._css.important) {
                tag.originalBackgroundImage = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(this._css.filter);
            if (value && tag.currentFilter !== value) {
                tag.originalFilter = value;
                needReCalculation = true;
            }
            value = tag.style.getPropertyValue(this._css.transitionProperty);
            if (value && tag.style.getPropertyPriority(this._css.transitionProperty) !== this._css.important) {
                const { hasForbiddenTransition } = this.calculateTransition(value);
                if (hasForbiddenTransition) {
                    tag.originalTransitionProperty = value;
                    needReCalculation = true;
                }
            }
            if (needReCalculation) {
                elementsForReCalculation.add(tag);
            }
        });
        this.reCalcAllRootElements(elementsForReCalculation, false, true);
    }
    onClassChanged(changedElements) {
        this.reCalcAllRootElements(changedElements, false);
    }
    IsIgnored(tag) {
        if ("mlIgnore" in tag) {
            return !!tag.mlIgnore;
        }
        if (tag.parentElement) {
            return tag.mlIgnore = this.IsIgnored(tag.parentElement);
        }
        return tag.mlIgnore = false;
    }
    onElementsAdded(addedElements) {
        const filter = this.getFilterOfElementsForComplexProcessing();
        addedElements.forEach(tag => this.restoreElementColors(tag));
        const allNewTags = Array.from(addedElements.values())
            .filter(x => !this.IsIgnored(x) && this.checkElement(x));
        const allChildTags = new Set();
        allNewTags.forEach(newTag => {
            if (newTag.getElementsByTagName) {
                Array.prototype.forEach.call(newTag.getElementsByTagName("*"), (childTag) => {
                    if (addedElements.has(childTag) === false) {
                        this.restoreElementColors(childTag);
                        if (filter(childTag)) {
                            allChildTags.add(childTag);
                        }
                    }
                });
            }
        });
        DocumentProcessor_1.processAllElements(allNewTags.concat(Array.from(allChildTags.values())), this, this._settingsManager.isComplex ? bigReCalculationDelays : smallReCalculationDelays);
    }
    static processAllElements(allTags, docProc, delays = normalDelays, delayInvisibleElements = true, needObservation = true) {
        if (allTags.length > 0) {
            let rowNumber = 0, ns = USP.htm, isSvg, isVisible, isImage = false, isLink = false, hasBgColor = false, hasBgImage = false, inView, otherInvisTags = new Array(), doc = allTags[0].ownerDocument, hm = doc.defaultView.innerHeight, wm = doc.defaultView.innerWidth;
            let elementsFilter = null;
            if (!delayInvisibleElements) {
                if (docProc._settingsManager.isSimple) {
                    elementsFilter = docProc.getFilterOfElementsForSimplifiedProcessing();
                }
                else if (docProc._settingsManager.isFilter) {
                    elementsFilter = docProc.getFilterOfElementsForFilterProcessing();
                }
            }
            for (let tag of allTags) {
                tag.mlRowNumber = rowNumber++;
                isSvg = tag instanceof SVGElement;
                ns = isSvg ? USP.svg : USP.htm;
                if (elementsFilter && !elementsFilter(tag)) {
                    break;
                }
                isVisible = isSvg || tag.offsetParent !== null || !!tag.offsetHeight;
                if (isVisible || tag.mlComputedStyle || !delayInvisibleElements || allTags.length < minChunkableLength) {
                    tag.mlComputedStyle = tag.mlComputedStyle || doc.defaultView.getComputedStyle(tag, "");
                    if (!tag.mlComputedStyle)
                        break;
                    isLink = tag instanceof HTMLAnchorElement;
                    hasBgColor = tag.mlComputedStyle.getPropertyValue(ns.css.bgrColor) !== RgbaColor.Transparent;
                    isImage = (tag.tagName === ns.img) || tag instanceof HTMLCanvasElement;
                    hasBgImage = !hasBgColor && tag.mlComputedStyle.backgroundImage !== docProc._css.none;
                }
                if (isVisible) {
                    tag.mlRect = tag.mlRect || tag.getBoundingClientRect();
                    isVisible = tag.mlRect.width !== 0 && tag.mlRect.height !== 0;
                    isVisible && (tag.mlArea = tag.mlArea || tag.mlRect.width * tag.mlRect.height);
                    inView = isVisible &&
                        (tag.mlRect.bottom >= 0 && tag.mlRect.bottom <= hm || tag.mlRect.top >= 0 && tag.mlRect.top <= hm) &&
                        (tag.mlRect.right >= 0 && tag.mlRect.right <= wm || tag.mlRect.left >= 0 && tag.mlRect.left <= wm);
                    if (!isVisible) {
                        tag.mlRect = tag.mlArea = undefined;
                        if (hasBgColor) {
                            tag.mlOrder = po.invisColorTags;
                            if (tag instanceof SVGSVGElement && tag.parentElement) {
                                DocumentProcessor_1.fixParentElementsOrder(tag.parentElement, po.invisColorTags);
                            }
                        }
                        else if (isImage)
                            tag.mlOrder = po.invisImageTags;
                        else if (hasBgImage)
                            tag.mlOrder = po.invisBgImageTags;
                        else if (isLink)
                            tag.mlOrder = po.invisLinks;
                        else
                            tag.mlOrder = po.invisTransTags;
                    }
                    else if (hasBgColor) {
                        if (inView)
                            tag.mlOrder = po.viewColorTags;
                        else
                            tag.mlOrder = po.visColorTags;
                    }
                    else if (isImage) {
                        if (inView)
                            tag.mlOrder = po.viewImageTags;
                        else
                            tag.mlOrder = po.visImageTags;
                    }
                    else if (hasBgImage) {
                        if (inView)
                            tag.mlOrder = po.viewBgImageTags;
                        else
                            tag.mlOrder = po.visBgImageTags;
                    }
                    else if (isLink) {
                        if (inView)
                            tag.mlOrder = po.viewLinks;
                        else
                            tag.mlOrder = po.visLinks;
                    }
                    else {
                        if (inView)
                            tag.mlOrder = po.viewTransTags;
                        else
                            tag.mlOrder = po.visTransTags;
                    }
                }
                else if (tag.mlComputedStyle) {
                    if (hasBgColor)
                        tag.mlOrder = po.invisColorTags;
                    else if (isImage)
                        tag.mlOrder = po.invisImageTags;
                    else if (hasBgImage)
                        tag.mlOrder = po.invisBgImageTags;
                    else if (isLink)
                        tag.mlOrder = po.invisLinks;
                    else
                        tag.mlOrder = po.invisTransTags;
                }
                else {
                    tag.mlOrder = po.delayedInvisTags;
                    otherInvisTags.push(tag);
                }
            }
            doc.body.mlOrder = po.viewColorTags;
            allTags.sort((a, b) => a instanceof HTMLBodyElement ? -9999999999
                : b instanceof HTMLBodyElement ? 9999999999
                    : a.mlOrder !== b.mlOrder ? a.mlOrder - b.mlOrder
                        : b.mlArea && a.mlArea && b.mlArea !== a.mlArea ? b.mlArea - a.mlArea
                            : a.mlRowNumber - b.mlRowNumber);
            otherInvisTags = otherInvisTags.filter(tag => tag.mlOrder === po.delayedInvisTags);
            if (otherInvisTags.length && otherInvisTags.length < allTags.length) {
                allTags.splice(allTags.length - otherInvisTags.length, otherInvisTags.length);
            }
            allTags[0].mlOrder = po.viewColorTags;
            const results = handlePromise(DocumentProcessor_1.processOrderedElements(allTags, docProc, delays, needObservation));
            if (otherInvisTags.length > 0) {
                Promise.all([otherInvisTags, docProc, delays, results]).then(([otherTags, dp, dl]) => {
                    const density = 1000 / otherTags.length;
                    const getNextDelay = ((_delays, _density, [chunk]) => Math.round(_delays.get(chunk[0].mlOrder || po.viewColorTags) / _density))
                        .bind(null, delays, density);
                    forEachPromise(sliceIntoChunks(otherTags, chunkLength * 2).map(chunk => [chunk, dp, dl]), DocumentProcessor_1.processAllElements, Math.round(delays.get(po.delayedInvisTags) / density), getNextDelay);
                });
            }
            DocumentProcessor_1.fixColorInheritance(allTags, docProc, results);
        }
    }
    static fixParentElementsOrder(parentElement, procOrd) {
        if (parentElement.mlOrder && parentElement.mlOrder > procOrd) {
            parentElement.mlOrder = procOrd;
            if (parentElement.parentElement) {
                DocumentProcessor_1.fixParentElementsOrder(parentElement.parentElement, procOrd);
            }
        }
    }
    static fixColorInheritance(allTags, docProc, results) {
        if (docProc._settingsManager.isComplex) {
            const waitResults = Promise.all([allTags, docProc, results]);
            waitResults.then(([tags, dp]) => {
                if (tags && tags.length > 0) {
                    setTimeout(((t, dProc) => {
                        const brokenColorTags = t.filter(tag => tag.ownerDocument.defaultView &&
                            !tag.isPseudo && tag.mlColor && tag.mlColor.color === null &&
                            tag.mlColor.reason === ColorReason.Inherited &&
                            tag.mlColor.intendedColor && tag.mlComputedStyle &&
                            tag.mlColor.intendedColor !== (tag instanceof HTMLElement
                                ? tag.mlComputedStyle.color
                                : tag.mlComputedStyle.fill));
                        if (brokenColorTags.length > 0) {
                            dProc._documentObserver.stopDocumentObservation(brokenColorTags[0].ownerDocument);
                            brokenColorTags.forEach(tag => {
                                const ns = tag instanceof SVGElement ? USP.svg : USP.htm;
                                const newColor = Object.assign({}, tag.mlColor);
                                newColor.base = dProc._app.isDebug ? tag.mlColor : null;
                                newColor.reason = ColorReason.FixedInheritance;
                                newColor.color = newColor.intendedColor;
                                tag.mlColor = newColor;
                                tag.originalColor = tag.style.getPropertyValue(ns.css.fntColor);
                                tag.style.setProperty(ns.css.fntColor, newColor.color, dProc._css.important);
                            });
                            docProc._documentObserver.startDocumentObservation(brokenColorTags[0].ownerDocument);
                        }
                    }), 0, tags, dp);
                }
            });
            waitResults.then(([tags, dp]) => {
                if (tags && tags.length > 0) {
                    setTimeout(((t, dProc) => {
                        const brokenTransparentTags = t.filter(tag => tag.ownerDocument.defaultView && tag.mlBgColor &&
                            !tag.mlBgColor.color && tag.mlComputedStyle &&
                            tag.mlBgColor.reason === ColorReason.Parent &&
                            tag instanceof HTMLElement &&
                            tag.mlComputedStyle.backgroundColor !== RgbaColor.Transparent &&
                            !tag.mlFixed);
                        if (brokenTransparentTags.length > 0) {
                            dProc._documentObserver.stopDocumentObservation(brokenTransparentTags[0].ownerDocument);
                            brokenTransparentTags.forEach(tag => {
                                dProc.restoreElementColors(tag, true);
                                tag.mlFixed = "bgcolor";
                            });
                            dProc._documentObserver.startDocumentObservation(brokenTransparentTags[0].ownerDocument);
                            DocumentProcessor_1.processAllElements(brokenTransparentTags, dProc, bigReCalculationDelays);
                        }
                    }), 0, tags, dp);
                }
            });
        }
    }
    static getBrokenTransparentElements(prevChunk) {
        return prevChunk.filter(tag => tag.ownerDocument.defaultView && tag.mlBgColor &&
            !tag.mlBgColor.color && tag.mlComputedStyle &&
            tag.mlBgColor.reason === ColorReason.Parent &&
            tag instanceof HTMLElement &&
            tag.mlComputedStyle.backgroundColor !== RgbaColor.Transparent &&
            !tag.mlFixed);
    }
    static calculateNewRoomRulesToFixColorInheritanceInPrevChunk(prevChunk, docProc) {
        return prevChunk.filter(tag => tag.ownerDocument.defaultView &&
            tag.mlColor && tag.mlColor.color === null &&
            tag.mlColor.reason === ColorReason.Inherited &&
            tag.mlColor.intendedColor && tag.mlComputedStyle &&
            tag.mlColor.intendedColor !== (tag instanceof HTMLElement
                ? tag.mlComputedStyle.color
                : tag.mlComputedStyle.fill)).map(tag => {
            const newColor = Object.assign({}, tag.mlColor);
            newColor.base = docProc._app.isDebug ? tag.mlColor : null;
            newColor.reason = ColorReason.FixedInheritance;
            newColor.color = newColor.intendedColor;
            return {
                tag: tag, result: { roomRules: { color: newColor } }
            };
        });
    }
    static processOrderedElements(tags, docProc, delays = normalDelays, needObservation = false) {
        if (tags.length > 0) {
            const density = 2000 / tags.length;
            needObservation = needObservation && docProc._settingsManager.isComplex &&
                !!docProc._styleSheetProcessor.getSelectorsCount(tags[0].ownerDocument);
            let result;
            if (tags.length < minChunkableLength) {
                result = DocumentProcessor_1.processElementsChunk(tags, docProc, null, delays.get(tags[0].mlOrder || po.viewColorTags) / density);
            }
            else {
                const getNextDelay = ((_delays, _density, [chunk]) => Math.round(_delays.get(chunk[0].mlOrder || po.viewColorTags) / _density))
                    .bind(null, delays, density);
                result = forEachPromise(this.concatZeroDelayedChunks(sliceIntoChunks(tags, chunkLength), getNextDelay)
                    .map(chunk => [chunk, docProc]), DocumentProcessor_1.processElementsChunk, 0, getNextDelay);
            }
            if (needObservation) {
                Promise.all([tags, docProc, handlePromise(result), ...docProc._styleSheetProcessor.getCssPromises(tags[0].ownerDocument)])
                    .then(([t, dp]) => DocumentProcessor_1.startObservation(t, dp));
            }
            return result;
        }
        return undefined;
    }
    static concatZeroDelayedChunks(chunks, getNextDelay) {
        let zeroDelayedChunk = [];
        let ix = 0, nextChunk = chunks[ix];
        while (nextChunk && getNextDelay([nextChunk]) === 0) {
            zeroDelayedChunk = zeroDelayedChunk.concat(nextChunk);
            nextChunk = chunks[++ix];
        }
        if (ix > 1 && zeroDelayedChunk.length) {
            chunks.splice(0, ix, zeroDelayedChunk);
        }
        return chunks;
    }
    static processElementsChunk(chunk, docProc, prevChunk, delay) {
        docProc._documentObserver.stopDocumentObservation(chunk[0].ownerDocument);
        const paramsForPromiseAll = [[...chunk], chunk[0].ownerDocument, delay];
        if (prevChunk) {
            const brokenTransparentElements = DocumentProcessor_1.getBrokenTransparentElements(prevChunk);
            if (brokenTransparentElements.length) {
                brokenTransparentElements.forEach(tag => {
                    docProc.restoreElementColors(tag, true);
                    tag.mlFixed = "bgcolor";
                });
                chunk.splice(0, 0, ...brokenTransparentElements);
            }
        }
        const results = DocumentProcessor_1.calculateNewRoomRulesToFixColorInheritanceInPrevChunk(prevChunk || [], docProc).concat(chunk.map(tag => ({
            tag: tag, result: docProc._settingsManager.isComplex
                ? docProc.calculateRoomRules(tag)
                : docProc._settingsManager.isSimple
                    ? docProc.calculateSimplifiedRoomRules(tag)
                    : docProc.calculateFilterRoomRules(tag)
        })));
        results
            .filter(r => r.result)
            .map(tr => {
            return Object.assign(tr, {
                beforeRoomRules: tr.result.before && docProc.calculateRoomRules(tr.result.before),
                afterRoomRules: tr.result.after && docProc.calculateRoomRules(tr.result.after)
            });
        })
            .map(tr => {
            docProc.applyRoomRules(tr.tag, tr.result.roomRules);
            if (tr.beforeRoomRules) {
                docProc.applyRoomRules(tr.result.before, tr.beforeRoomRules.roomRules);
            }
            if (tr.afterRoomRules) {
                docProc.applyRoomRules(tr.result.after, tr.afterRoomRules.roomRules);
            }
            return [tr.result.before, tr.result.after].filter(x => x).map(x => x.stylePromise);
        })
            .filter(r => r).forEach(r => paramsForPromiseAll.push(...r.map(handlePromise)));
        docProc._documentObserver.startDocumentObservation(chunk[0].ownerDocument);
        return Promise.all(paramsForPromiseAll)
            .then(([tags, doc, dl, ...cssArray]) => {
            let css = cssArray
                .filter(result => result.status === Status.Success && result.data)
                .map(result => result.data)
                .join("\n");
            if (css) {
                doc.mlPseudoStyles.appendChild(doc.createTextNode(css));
            }
            return tags;
        });
    }
    static startObservation(tags, docProc) {
        tags.forEach(tag => {
            if (!tag.isObserved) {
                docProc.observeUserActions(tag);
            }
        });
    }
    tagIsSmall(tag) {
        if (smallRoles.test(tag.getAttribute(this._css.role) || "")) {
            return true;
        }
        let maxSize = this._settingsManager.isFilter ? 100 : 50, maxAxis = this._settingsManager.isFilter ? 50 : 25, check = (w, h) => w > 0 && h > 0 && (w < maxSize && h < maxSize || w < maxAxis || h < maxAxis);
        tag.mlComputedStyle = tag.mlComputedStyle || tag.ownerDocument.defaultView.getComputedStyle(tag, "");
        let width = parseInt(tag.mlComputedStyle.width), height = parseInt(tag.mlComputedStyle.height);
        if (!isNaN(width) && !isNaN(height)) {
            tag.mlArea = tag.mlArea || width * height;
            return check(width, height);
        }
        else if (!isNaN(width) && width < maxAxis && width > 0) {
            return true;
        }
        else if (!isNaN(height) && height < maxAxis && height > 0) {
            return true;
        }
        else {
            tag.mlRect = tag.mlRect || tag.getBoundingClientRect();
            tag.mlArea = tag.mlRect.width * tag.mlRect.height;
            return check(tag.mlRect.width, tag.mlRect.height);
        }
    }
    calcTagArea(tag, tryClientRect = true) {
        if (tag.mlArea === undefined) {
            tag.mlComputedStyle = tag.mlComputedStyle || tag.ownerDocument.defaultView.getComputedStyle(tag, "");
            let width = parseInt(tag.mlComputedStyle.width), height = parseInt(tag.mlComputedStyle.height);
            if (!isNaN(width) && !isNaN(height)) {
                tag.mlArea = width * height;
            }
            else if (tryClientRect) {
                tag.mlRect = tag.mlRect || tag.getBoundingClientRect();
                if (tag.mlRect.width || tag.mlRect.height) {
                    tag.mlArea = tag.mlRect.width * tag.mlRect.height;
                }
                else {
                    tag.mlRect = null;
                }
            }
        }
    }
    getElementIndex(tag) {
        for (var i = 0; tag = tag.previousElementSibling; i++)
            ;
        return i;
    }
    isEditableContent(tag) {
        if (tag.contentEditable === true.toString()) {
            tag.isEditableContent = true;
        }
        else if (tag.contentEditable === false.toString()) {
            tag.isEditableContent = false;
        }
        else if (tag.parentElement) {
            if (tag.parentElement.isEditableContent !== undefined) {
                tag.isEditableContent = tag.parentElement.isEditableContent;
            }
            else {
                tag.isEditableContent = this.isEditableContent(tag.parentElement);
            }
            return tag.isEditableContent;
        }
        else {
            tag.isEditableContent = false;
        }
        return tag.isEditableContent;
    }
    getParentBackground(tag, probeRect) {
        let result = Object.assign({}, tag.ownerDocument.body.mlBgColor || NotFound);
        result.reason = ColorReason.NotFound;
        if (tag.parentElement) {
            let bgColor;
            let doc = tag.ownerDocument;
            let isSvg = tag instanceof SVGElement &&
                tag.parentElement instanceof SVGElement;
            tag.mlComputedStyle = tag.mlComputedStyle || doc.defaultView.getComputedStyle(tag, "");
            if (tag.mlComputedStyle && tag instanceof HTMLElement &&
                (tag.mlComputedStyle.position == this._css.absolute ||
                    tag.mlComputedStyle.position == this._css.relative || isSvg)) {
                tag.zIndex = isSvg ? this.getElementIndex(tag) : parseInt(tag.mlComputedStyle.zIndex || "0");
                tag.zIndex = isNaN(tag.zIndex) ? -999 : tag.zIndex;
                let children = Array.prototype.filter.call(tag.parentElement.children, (otherTag, index) => {
                    if (otherTag != tag) {
                        otherTag.zIndex = otherTag.zIndex || isSvg ? -index :
                            parseInt((otherTag.mlComputedStyle = otherTag.mlComputedStyle ? otherTag.mlComputedStyle
                                : doc.defaultView.getComputedStyle(otherTag, "")).zIndex || "0");
                        otherTag.zIndex = isNaN(otherTag.zIndex) ? -999 : otherTag.zIndex;
                        if (otherTag.mlBgColor && otherTag.mlBgColor.color &&
                            otherTag.zIndex < tag.zIndex && otherTag.mlBgColor.role !== cc.TextSelection) {
                            probeRect = probeRect || (tag.mlRect = tag.mlRect || tag.getBoundingClientRect());
                            otherTag.mlRect = otherTag.mlRect || otherTag.getBoundingClientRect();
                            if (otherTag.mlRect.left <= probeRect.left && otherTag.mlRect.top <= probeRect.top &&
                                otherTag.mlRect.right >= probeRect.right && otherTag.mlRect.bottom >= probeRect.bottom) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
                if (children.length > 0) {
                    let maxZIndex = 0;
                    children.forEach(el => {
                        if (el.zIndex > maxZIndex) {
                            maxZIndex = el.zIndex;
                            bgColor = el.mlBgColor;
                        }
                    });
                }
            }
            bgColor = bgColor ||
                ((tag.parentElement.mlBgColor &&
                    tag.parentElement.mlBgColor.isUpToDate &&
                    !(tag.parentElement instanceof SVGGElement))
                    ? tag.parentElement.mlBgColor : null) ||
                tag.parentElement.mlParentBgColor;
            if (bgColor && bgColor.alpha > 0.2) {
                result = bgColor;
            }
            else {
                probeRect = probeRect || (tag.mlRect = tag.mlRect || tag.getBoundingClientRect());
                result = this.getParentBackground(tag.parentElement, probeRect);
            }
        }
        if (tag instanceof Element) {
            tag.mlParentBgColor = result;
        }
        return result;
    }
    getColoredParent(tag, checkBackground, checkForeground) {
        let bgOk = !checkBackground || !!tag.style.backgroundColor, fgOk = !checkForeground || !!tag.style.color;
        if (bgOk && fgOk) {
            return tag;
        }
        else if (tag.parentElement) {
            return this.getColoredParent(tag.parentElement, !bgOk, !fgOk);
        }
        else {
            return tag;
        }
    }
    restoreDocumentColors(doc) {
        DocumentProcessor_dom.removeAllEventListeners(doc);
        this._documentObserver.stopDocumentUpdateObservation(doc);
        this._documentObserver.stopDocumentObservation(doc);
        this.removeDynamicValuesStyle(doc);
        this.removePageScript(doc);
        this.clearPseudoStyles(doc);
        this.restoreMetaTheme(doc);
        const lastProcMode = this.getLastDoccumentProcessingMode(doc);
        this.setDocumentProcessingStage(doc, ProcessingStage.None);
        const isPopup = doc.location.pathname === "/ui/popup.html";
        for (let tag of Array.from(doc.getElementsByTagName("*"))) {
            if (!isPopup) {
                delete tag.isObserved;
                DocumentProcessor_dom.removeAllEventListeners(tag);
            }
            this.restoreElementColors(tag, this._settingsManager.isActive && this._settingsManager.isComplex, lastProcMode);
        }
    }
    restoreElementColors(tag, keepTransition, lastProcMode) {
        delete tag.mlParentBgColor;
        delete tag.mlPath;
        if (tag.mlBgColor || tag.mlInvert || tag.originalBackgroundImage !== undefined ||
            tag instanceof Element &&
                (lastProcMode === ProcessingMode.Simplified || this._settingsManager.isSimple)) {
            let ns = tag instanceof SVGElement ? USP.svg : USP.htm;
            const hasLinkColors = tag.mlColor && tag.mlColor.role === cc.Link;
            delete tag.mlBgColor;
            delete tag.mlInvert;
            delete tag.mlColor;
            delete tag.mlTextShadow;
            delete tag.mlRect;
            delete tag.mlSelectors;
            delete tag.mlFixed;
            delete tag.mlVisualAttributeChanged;
            if (tag.originalTransitionProperty !== undefined && !keepTransition &&
                tag.style.transitionProperty !== tag.originalTransitionProperty) {
                tag.style.transitionProperty = tag.originalTransitionProperty;
            }
            if (keepTransition && tag.originalTransitionProperty === undefined &&
                tag.hasTransition && tag.mlComputedStyle) {
                if (tag.mlComputedStyle.transitionProperty &&
                    tag.mlComputedStyle.transitionDuration &&
                    tag.mlComputedStyle.transitionDuration !== this._css._0s &&
                    tag.mlComputedStyle.transitionProperty !== this._css.none) {
                    const { hasForbiddenTransition, newTransProps } = this.calculateTransition(tag.mlComputedStyle.transitionProperty);
                    if (hasForbiddenTransition) {
                        tag.originalTransitionProperty = tag.style.transitionProperty;
                        tag.style.setProperty(this._css.transitionProperty, newTransProps.join(", "), this._css.important);
                    }
                }
            }
            if (tag.originalBackgroundColor !== undefined &&
                tag.originalBackgroundColor !== tag.style.getPropertyValue(ns.css.bgrColor)) {
                tag.style.setProperty(ns.css.bgrColor, tag.originalBackgroundColor);
            }
            if (tag.originalDisplay !== undefined && tag.originalDisplay !== tag.style.display) {
                tag.style.display = tag.originalDisplay;
            }
            if (tag.originalColor !== undefined) {
                if (tag.originalColor !== tag.style.getPropertyValue(ns.css.fntColor)) {
                    tag.style.setProperty(ns.css.fntColor, tag.originalColor);
                }
                tag.style.removeProperty(this._css.placeholderColor);
            }
            if (tag.isEditableContent) {
                tag.style.removeProperty(this._css.originalColor);
                tag.style.removeProperty(this._css.editableContentColor);
                tag.style.removeProperty(this._css.originalBackgroundColor);
                tag.style.removeProperty(this._css.editableContentBackgroundColor);
            }
            if (hasLinkColors) {
                tag.style.removeProperty(this._css.linkColor);
                tag.style.removeProperty(this._css.visitedColor);
                tag.style.removeProperty(this._css.linkColorActive);
                tag.style.removeProperty(this._css.visitedColorActive);
                tag.style.removeProperty(this._css.linkColorHover);
                tag.style.removeProperty(this._css.visitedColorHover);
            }
            if (tag.originalTextShadow !== undefined && tag.style.textShadow !== tag.originalTextShadow) {
                tag.style.textShadow = tag.originalTextShadow;
            }
            if (tag.originalBorderColor !== undefined && tag.originalBorderColor !== tag.style.getPropertyValue(ns.css.brdColor)) {
                tag.style.setProperty(ns.css.brdColor, tag.originalBorderColor);
            }
            if (tag.originalBorderTopColor !== undefined && tag.style.borderTopColor !== tag.originalBorderTopColor) {
                tag.style.borderTopColor = tag.originalBorderTopColor;
            }
            if (tag.originalBorderRightColor !== undefined && tag.style.borderRightColor !== tag.originalBorderRightColor) {
                tag.style.borderRightColor = tag.originalBorderRightColor;
            }
            if (tag.originalBorderBottomColor !== undefined && tag.style.borderBottomColor !== tag.originalBorderBottomColor) {
                tag.style.borderBottomColor = tag.originalBorderBottomColor;
            }
            if (tag.originalBorderLeftColor !== undefined && tag.style.borderLeftColor !== tag.originalBorderLeftColor) {
                tag.style.borderLeftColor = tag.originalBorderLeftColor;
            }
            if (tag.originalBackgroundImage !== undefined && tag.style.backgroundImage !== tag.originalBackgroundImage) {
                tag.style.backgroundImage = tag.originalBackgroundImage;
            }
            if (tag.originalFilter !== undefined && tag.style.filter !== tag.originalFilter) {
                tag.style.filter = tag.originalFilter;
            }
            if (tag.hasAttribute(this._css.transition)) {
                tag.removeAttribute(this._css.transition);
            }
            if (tag.hasAttribute("before-style")) {
                tag.removeAttribute("before-style");
            }
            if (tag.hasAttribute("after-style")) {
                tag.removeAttribute("after-style");
            }
            if (tag.hasAttribute("ml-bg-image")) {
                tag.removeAttribute("ml-bg-image");
            }
            if (tag.hasAttribute(this._css.mlInvertAttr)) {
                tag.removeAttribute(this._css.mlInvertAttr);
            }
        }
    }
    checkElement(tag) {
        return tag.isChecked =
            (tag instanceof Element || tag.ownerDocument && tag.ownerDocument.defaultView && tag instanceof Element) &&
                !tag.mlBgColor && !!tag.tagName && !tag.mlIgnore && !!tag.style;
    }
    calculateFilterRoomRules(tag) {
        if (tag && tag.ownerDocument.defaultView && !tag.classList.contains("ml-ignore") &&
            this._filterForFilterProcessing(tag) &&
            (!tag.mlComputedStyle || tag.mlComputedStyle.getPropertyValue(this._css.mlIgnoreVar) !== true.toString())) {
            let hasRoomRules = false;
            const doc = tag.ownerDocument, roomRules = {};
            tag.mlComputedStyle = tag.mlComputedStyle || doc.defaultView.getComputedStyle(tag, "");
            if (tag.mlComputedStyle.filter === this._css.none && tag.mlInvert) {
                hasRoomRules = true;
                roomRules.attributes = roomRules.attributes || new Map();
                roomRules.attributes.set(this._css.mlInvertAttr, "");
            }
            if (hasRoomRules) {
                return { roomRules, before: undefined, after: undefined };
            }
        }
        return undefined;
    }
    calculateSimplifiedRoomRules(tag) {
        if (tag && tag.ownerDocument.defaultView && !tag.classList.contains("ml-ignore") &&
            (!tag.mlComputedStyle || tag.mlComputedStyle.getPropertyValue(this._css.mlIgnoreVar) !== true.toString())) {
            let hasRoomRules = false;
            const doc = tag.ownerDocument, roomRules = {}, bgInverted = this.shift.Background.lightnessLimit < 0.3, isButton = tag instanceof HTMLButtonElement ||
                tag instanceof HTMLInputElement &&
                    (tag.type === "button" || tag.type === "submit" || tag.type === "reset") ||
                tag instanceof Element && tag.getAttribute(this._css.role) === "button";
            tag.mlComputedStyle = tag.mlComputedStyle || doc.defaultView.getComputedStyle(tag, "");
            if (!(tag instanceof HTMLImageElement) && tag.mlComputedStyle.backgroundImage &&
                tag.mlComputedStyle.backgroundImage !== this._css.none &&
                tag.mlComputedStyle.backgroundImage !== this._rootImageUrl) {
                hasRoomRules = true;
                this.processBackgroundImagesAndGradients(tag, doc, roomRules, isButton, bgInverted);
            }
            if (tag instanceof HTMLCanvasElement ||
                tag instanceof HTMLEmbedElement && tag.getAttribute("type") === "application/pdf") {
                hasRoomRules = true;
                this.processInaccessibleTextContent({ tag, roomRules });
            }
            if (hasRoomRules) {
                return { roomRules, before: undefined, after: undefined };
            }
        }
        return undefined;
    }
    calculateRoomRules(tag) {
        if (tag && tag.ownerDocument.defaultView && !tag.mlBgColor &&
            (!(tag instanceof Element) || !tag.mlComputedStyle ||
                !(tag.mlIgnore = tag.mlComputedStyle.getPropertyValue(this._css.mlIgnoreVar) === true.toString()))) {
            let doc = tag.ownerDocument;
            let bgLight, roomRules;
            let isSvg = tag instanceof SVGElement, isSvgText = tag instanceof SVGTextContentElement, isLink = tag instanceof HTMLAnchorElement, isButton = tag instanceof HTMLButtonElement ||
                tag instanceof HTMLInputElement &&
                    (tag.type === "button" || tag.type === "submit" || tag.type === "reset") ||
                tag instanceof Element && tag.getAttribute("role") === "button" ||
                !!tag.className && typeof tag.className === "string" && /button\b|btn\b/gi.test(tag.className), isTable = tag instanceof HTMLTableElement || tag instanceof HTMLTableCellElement ||
                tag instanceof HTMLTableRowElement || tag instanceof HTMLTableSectionElement;
            let ns = isSvg ? USP.svg : USP.htm;
            let beforePseudoElement, afterPseudoElement;
            tag instanceof HTMLElement && tag.isEditableContent === undefined &&
                this.isEditableContent(tag);
            if (!isButton && tag instanceof HTMLLabelElement && tag.htmlFor) {
                const labeledElement = doc.getElementById(tag.htmlFor);
                isButton = labeledElement instanceof HTMLInputElement &&
                    labeledElement.type === "file";
            }
            if (isLink && !isButton && !isSvg && tag.className &&
                (tag.className.includes("button") || tag.className.includes("btn"))) {
                isButton = true;
            }
            tag.mlComputedStyle = tag.mlComputedStyle || doc.defaultView.getComputedStyle(tag, "");
            roomRules = {};
            if (tag.mlComputedStyle) {
                this._app.isDebug && (roomRules.owner = tag);
                if (tag instanceof HTMLElement) {
                    let beforeStyle = doc.defaultView.getComputedStyle(tag, ":before");
                    let afterStyle = doc.defaultView.getComputedStyle(tag, ":after");
                    if (beforeStyle && beforeStyle.content &&
                        beforeStyle.content !== this._css.none &&
                        beforeStyle.getPropertyValue(this._css.mlIgnoreVar) !== true.toString()) {
                        beforePseudoElement = new PseudoElement(PseudoType.Before, tag, beforeStyle);
                    }
                    if (afterStyle && afterStyle.content &&
                        afterStyle.content !== this._css.none &&
                        afterStyle.getPropertyValue(this._css.mlIgnoreVar) !== true.toString()) {
                        afterPseudoElement = new PseudoElement(PseudoType.After, tag, afterStyle);
                    }
                }
                if (tag.mlComputedStyle &&
                    tag.mlComputedStyle.transitionProperty &&
                    tag.mlComputedStyle.transitionProperty &&
                    tag.mlComputedStyle.transitionDuration &&
                    tag.mlComputedStyle.transitionDuration !== this._css._0s &&
                    tag.mlComputedStyle.transitionProperty !== this._css.none) {
                    let { hasForbiddenTransition, newTransProps } = this.calculateTransition(tag.mlComputedStyle.transitionProperty);
                    if (hasForbiddenTransition) {
                        roomRules.transitionProperty = { value: newTransProps.join(", ") };
                    }
                }
                const bgrColor = tag instanceof HTMLElement && tag.isEditableContent
                    ? tag.style.getPropertyValue(this._css.backgroundColor)
                    : tag.mlComputedStyle.getPropertyValue(ns.css.bgrColor);
                if (!isSvgText) {
                    if (tag instanceof SVGElement) {
                        if (this.tagIsSmall(tag instanceof SVGSVGElement ? tag : tag.ownerSVGElement || tag) &&
                            tag.mlComputedStyle.getPropertyValue("--ml-small-svg-is-text") === true.toString()) {
                            isSvgText = true;
                            roomRules.backgroundColor = Object.assign({}, this.getParentBackground(tag.ownerSVGElement || tag));
                            roomRules.backgroundColor.reason = ColorReason.SvgText;
                            roomRules.backgroundColor.color = null;
                        }
                        else {
                            roomRules.backgroundColor = this.changeColor({ role: cc.SvgBackground, property: ns.css.bgrColor, tag: tag, propVal: bgrColor });
                        }
                    }
                    else {
                        roomRules.backgroundColor = this.changeColor({ role: isButton ? cc.ButtonBackground : cc.Background, property: ns.css.bgrColor, tag: tag, propVal: bgrColor });
                    }
                    if (this._app.preserveDisplay && roomRules.backgroundColor && roomRules.backgroundColor.color && tag.id && tag.className) {
                        roomRules.display = tag.mlComputedStyle.display;
                    }
                }
                if (!roomRules.backgroundColor) {
                    roomRules.backgroundColor = Object.assign({}, this.getParentBackground(tag));
                    roomRules.backgroundColor.color = null;
                }
                if (tag.tagName == ns.img &&
                    (this.shift.Image.lightnessLimit < 1 || this.shift.Image.saturationLimit < 1 ||
                        this._settingsManager.currentSettings.blueFilter !== 0)) {
                    const customImageRole = tag.mlComputedStyle.getPropertyValue(`--ml-${cc[cc.Image].toLowerCase()}`);
                    let imgSet = this.shift[customImageRole] || this.shift.Image;
                    roomRules.filter =
                        {
                            value: [
                                tag.mlComputedStyle.filter != this._css.none ? tag.mlComputedStyle.filter : "",
                                imgSet.saturationLimit < 1 ? `saturate(${imgSet.saturationLimit})` : "",
                                this._settingsManager.currentSettings.blueFilter !== 0 ? `var(--${FilterType.BlueFilter})` : "",
                                imgSet.lightnessLimit < 1 ? `brightness(${imgSet.lightnessLimit})` : ""
                            ].filter(f => f).join(" ").trim()
                        };
                    roomRules.attributes = roomRules.attributes || new Map();
                    if (this._settingsManager.currentSettings.useImageHoverAnimation) {
                        roomRules.attributes.set(this._css.transition, this._css.filter);
                    }
                }
                bgLight = roomRules.backgroundColor.light;
                let bgInverted = roomRules.backgroundColor.originalLight - roomRules.backgroundColor.light > 0.4;
                if (roomRules.backgroundColor.color && roomRules.backgroundColor.alpha < 0.2) {
                    const parentBgColor = this.getParentBackground(tag);
                    bgLight = parentBgColor.light;
                    bgInverted = parentBgColor.originalLight - parentBgColor.light > 0.4;
                }
                if (tag.mlComputedStyle.content.startsWith("url") && !(tag instanceof PseudoElement &&
                    tag.parentElement.mlComputedStyle.content === tag.mlComputedStyle.content)) {
                    let doInvert = (!isTable) && bgInverted &&
                        !doNotInvertRegExp.test(tag.mlComputedStyle.content) &&
                        tag.mlComputedStyle.getPropertyValue("--ml-no-invert") !== true.toString() &&
                        (this.tagIsSmall(tag)
                            || tag.isPseudo && tag.parentElement.parentElement &&
                                this.tagIsSmall(tag.parentElement.parentElement) &&
                                tag.parentElement.parentElement.mlComputedStyle.overflow === this._css.hidden
                            || !tag.isPseudo && this.tagIsSmall(tag.parentElement) &&
                                tag.parentElement.mlComputedStyle.overflow === this._css.hidden);
                    if (this.shift.Image.lightnessLimit < 1 || this.shift.Image.saturationLimit < 1 || doInvert || this._settingsManager.currentSettings.blueFilter !== 0) {
                        let imgSet = this.shift.Image;
                        roomRules.filter =
                            {
                                value: [
                                    tag.mlComputedStyle.filter != this._css.none ? tag.mlComputedStyle.filter : "",
                                    imgSet.saturationLimit < 1 ? `saturate(${imgSet.saturationLimit})` : "",
                                    imgSet.lightnessLimit < 1 && !doInvert ? `brightness(${imgSet.lightnessLimit})` : "",
                                    doInvert ? `brightness(${DocumentProcessor_float.format(1 - this.shift.Background.lightnessLimit)})` : "",
                                    doInvert ? "hue-rotate(180deg) invert(1)" : "",
                                    this._settingsManager.currentSettings.blueFilter !== 0 ? `var(--${FilterType.BlueFilter})` : ""
                                ].filter(f => f).join(" ").trim()
                            };
                    }
                }
                if (!(tag instanceof HTMLImageElement) && tag.mlComputedStyle.backgroundImage &&
                    tag.mlComputedStyle.backgroundImage !== this._css.none &&
                    tag.mlComputedStyle.backgroundImage !== this._rootImageUrl) {
                    this.processBackgroundImagesAndGradients(tag, doc, roomRules, isButton, bgInverted);
                }
                if (tag instanceof HTMLInputElement || tag instanceof HTMLTextAreaElement) {
                    roomRules.placeholderColor = this.changeColor({
                        role: cc.Text, property: ns.css.fntColor, tag: tag, bgLight: bgLight,
                        propVal: "grba(0,0,0,0.6)"
                    });
                }
                if (!isSvg || isSvgText) {
                    if (isLink || !isSvg && (tag.parentElement instanceof HTMLAnchorElement ||
                        tag.parentElement && tag.parentElement.mlColor && tag.parentElement.mlColor.role === cc.Link)) {
                        const linkColor = this.changeColor({ role: cc.Link, property: ns.css.fntColor, tag: tag, bgLight: bgLight });
                        if (tag instanceof HTMLFontElement || linkColor && linkColor.role !== cc.Link) {
                            roomRules.color = linkColor;
                        }
                        else if (linkColor) {
                            roomRules.linkColor = linkColor;
                            roomRules.linkColor$Avtive = this.changeColor({ role: cc.Link$Active, propVal: linkColor.originalColor, property: ns.css.fntColor, tag: tag, bgLight: bgLight });
                            roomRules.linkColor$Hover = this.changeColor({ role: cc.Link$Hover, propVal: linkColor.originalColor, property: ns.css.fntColor, tag: tag, bgLight: bgLight });
                            roomRules.visitedColor = this.changeColor({ role: cc.VisitedLink, propVal: linkColor.originalColor, property: ns.css.fntColor, tag: tag, bgLight: bgLight });
                            roomRules.visitedColor$Active = this.changeColor({ role: cc.VisitedLink$Active, propVal: linkColor.originalColor, property: ns.css.fntColor, tag: tag, bgLight: bgLight });
                            roomRules.visitedColor$Hover = this.changeColor({ role: cc.VisitedLink$Hover, propVal: linkColor.originalColor, property: ns.css.fntColor, tag: tag, bgLight: bgLight });
                        }
                    }
                    else {
                        const txtColor = tag instanceof HTMLElement && tag.isEditableContent
                            ? tag instanceof HTMLFontElement && tag.color
                                ? this._colorConverter.convert(tag.color) || cx.Black
                                : tag.style.getPropertyValue(this._css.color)
                                    || tag.mlComputedStyle.getPropertyValue(this._css.color)
                            : tag.mlComputedStyle.getPropertyValue(ns.css.fntColor);
                        if (roomRules.backgroundColor && roomRules.backgroundColor.color &&
                            txtColor === bgrColor) {
                            roomRules.color = Object.assign(Object.assign({}, roomRules.backgroundColor), {
                                reason: ColorReason.SameAsBackground,
                                owner: this._app.isDebug ? tag : null
                            });
                        }
                        else {
                            roomRules.color = this.changeColor({
                                role: roomRules.backgroundColor.role === cc.HighlightedBackground
                                    ? cc.HighlightedText : cc.Text,
                                property: ns.css.fntColor, tag: tag, bgLight: bgLight, propVal: txtColor
                            });
                        }
                    }
                    if (roomRules.color || roomRules.linkColor) {
                        const textColor = roomRules.color || roomRules.linkColor;
                        let originalTextContrast = Math.abs(roomRules.backgroundColor.originalLight - textColor.originalLight);
                        let currentTextContrast = Math.abs(roomRules.backgroundColor.light - textColor.light);
                        if (currentTextContrast != originalTextContrast && textColor.originalLight != textColor.light &&
                            tag.mlComputedStyle.textShadow && tag.mlComputedStyle.textShadow !== this._css.none) {
                            let newTextShadow = tag.mlComputedStyle.textShadow, newColor = undefined, currentTextShadowColor, prevHslColor, shadowContrast, inheritedShadowColor;
                            let uniqColors = new Set(newTextShadow
                                .replace(/([\.\d]+px)/gi, '')
                                .match(/(rgba?\([^\)]+\)|#[a-z\d]+|[a-z]+)/gi) || []);
                            if (uniqColors.size > 0) {
                                uniqColors.forEach(c => {
                                    currentTextShadowColor = /rgb/gi.test(c) ? c : this._colorConverter.convert(c);
                                    if (currentTextShadowColor) {
                                        newColor = this.changeColor({
                                            role: cc.TextShadow, property: ns.css.shdColor,
                                            bgLight: textColor.light,
                                            propVal: currentTextShadowColor, tag
                                        });
                                        if (newColor && newColor.color) {
                                            newTextShadow = newTextShadow.replace(new RegExp(escapeRegex(c), "gi"), newColor.color);
                                        }
                                    }
                                });
                                if (newTextShadow !== tag.mlComputedStyle.textShadow) {
                                    roomRules.textShadow = { value: newTextShadow, color: newColor || null };
                                }
                            }
                        }
                    }
                }
                if (tag instanceof HTMLCanvasElement ||
                    tag instanceof HTMLEmbedElement && tag.getAttribute("type") === "application/pdf") {
                    this.processInaccessibleTextContent({ tag, roomRules });
                }
                if (isSvg && tag.mlComputedStyle.stroke !== this._css.none || !isSvg && (tag.mlComputedStyle.borderStyle && tag.mlComputedStyle.borderStyle !== this._css.none ||
                    !tag.mlComputedStyle.borderStyle && (tag.mlComputedStyle.borderTopStyle !== this._css.none ||
                        tag.mlComputedStyle.borderRightStyle !== this._css.none ||
                        tag.mlComputedStyle.borderBottomStyle !== this._css.none ||
                        tag.mlComputedStyle.borderLeftStyle !== this._css.none))) {
                    let brdColor = tag.mlComputedStyle.getPropertyValue(ns.css.brdColor);
                    const brdColorIsSingle = brdColor && brdColor.indexOf(" r") === -1 || !brdColor &&
                        tag.mlComputedStyle.borderTopColor === tag.mlComputedStyle.borderRightColor &&
                        tag.mlComputedStyle.borderRightColor === tag.mlComputedStyle.borderBottomColor &&
                        tag.mlComputedStyle.borderBottomColor === tag.mlComputedStyle.borderLeftColor;
                    if (brdColorIsSingle) {
                        brdColor = brdColor || tag.mlComputedStyle.borderTopColor;
                        if (brdColor === bgrColor) {
                            roomRules.borderColor = Object.assign(Object.assign({}, roomRules.backgroundColor), {
                                reason: ColorReason.SameAsBackground,
                                owner: this._app.isDebug ? tag : null
                            });
                        }
                        else {
                            roomRules.borderColor = this.changeColor({ role: isButton ? cc.ButtonBorder : cc.Border, property: ns.css.brdColor, tag: tag, bgLight: bgLight, propVal: brdColor });
                        }
                    }
                    else if (!isSvg) {
                        let borderRole = isButton ? cc.ButtonBorder : cc.Border, transBordersCount = 0;
                        if (tag.isPseudo && tag.mlComputedStyle.width === this._css._0px && tag.mlComputedStyle.height === this._css._0px &&
                            ((transBordersCount = [
                                tag.mlComputedStyle.borderTopColor,
                                tag.mlComputedStyle.borderRightColor,
                                tag.mlComputedStyle.borderBottomColor,
                                tag.mlComputedStyle.borderLeftColor
                            ].filter(c => c === RgbaColor.Transparent).length) === 3 ||
                                transBordersCount === 2 && [
                                    tag.mlComputedStyle.borderTopWidth,
                                    tag.mlComputedStyle.borderRightWidth,
                                    tag.mlComputedStyle.borderBottomWidth,
                                    tag.mlComputedStyle.borderLeftWidth
                                ].filter(c => c === this._css._0px).length === 1)) {
                            borderRole = cc.Background;
                        }
                        if (tag.mlComputedStyle.borderTopColor === bgrColor) {
                            roomRules.borderTopColor = Object.assign(Object.assign({}, roomRules.backgroundColor), {
                                reason: ColorReason.SameAsBackground,
                                owner: this._app.isDebug ? tag : null
                            });
                        }
                        else {
                            roomRules.borderTopColor = this.changeColor({ role: borderRole, property: this._css.borderTopColor, tag: tag, bgLight: bgLight });
                        }
                        if (tag.mlComputedStyle.borderRightColor === bgrColor) {
                            roomRules.borderRightColor = Object.assign(Object.assign({}, roomRules.backgroundColor), {
                                reason: ColorReason.SameAsBackground,
                                owner: this._app.isDebug ? tag : null
                            });
                        }
                        else {
                            roomRules.borderRightColor = this.changeColor({ role: borderRole, property: this._css.borderRightColor, tag: tag, bgLight: bgLight });
                        }
                        if (tag.mlComputedStyle.borderBottomColor === bgrColor) {
                            roomRules.borderBottomColor = Object.assign(Object.assign({}, roomRules.backgroundColor), {
                                reason: ColorReason.SameAsBackground,
                                owner: this._app.isDebug ? tag : null
                            });
                        }
                        else {
                            roomRules.borderBottomColor = this.changeColor({ role: borderRole, property: this._css.borderBottomColor, tag: tag, bgLight: bgLight });
                        }
                        if (tag.mlComputedStyle.borderLeftColor === bgrColor) {
                            roomRules.borderLeftColor = Object.assign(Object.assign({}, roomRules.backgroundColor), {
                                reason: ColorReason.SameAsBackground,
                                owner: this._app.isDebug ? tag : null
                            });
                        }
                        else {
                            roomRules.borderLeftColor = this.changeColor({ role: borderRole, property: this._css.borderLeftColor, tag: tag, bgLight: bgLight });
                        }
                    }
                }
            }
            if (tag instanceof Element) {
                tag.mlBgColor = roomRules.backgroundColor;
                tag.mlColor = roomRules.color || roomRules.linkColor;
                if (roomRules.textShadow) {
                    tag.mlTextShadow = roomRules.textShadow.color;
                }
            }
            return { roomRules: roomRules, before: beforePseudoElement, after: afterPseudoElement };
        }
        return undefined;
    }
    processInaccessibleTextContent({ tag, roomRules, strictBgLight = false, customTextLight, ignoreContentInvertRule = false }) {
        const applyContentFilter = this._settingsManager.currentSettings.blueFilter !== 0 ||
            this.shift.Background.graySaturation > colorOverlayLimit ||
            this.shift.Text.graySaturation > colorOverlayLimit;
        let filterValue;
        if (this.shift.Background.lightnessLimit < 0.3 &&
            (ignoreContentInvertRule || this._settingsManager.currentSettings.doNotInvertContent === false) &&
            tag.mlComputedStyle &&
            tag.mlComputedStyle.getPropertyValue("--ml-no-invert") !== true.toString()) {
            const darkSet = this.shift.Background, txtSet = this.shift.Text;
            roomRules.backgroundColor && (roomRules.backgroundColor.color = null);
            filterValue = [
                tag instanceof HTMLEmbedElement ? (`var(--${FilterType.PdfFilter})`) : "",
                darkSet.saturationLimit < 1 ? `saturate(${darkSet.saturationLimit})` : "",
                `brightness(${DocumentProcessor_float.format(Math.max(1 - darkSet.lightnessLimit, strictBgLight ? 0 : 0.9))})`,
                `hue-rotate(180deg) invert(1)`,
                applyContentFilter ? `var(--${FilterType.ContentFilter})` : "",
                `brightness(${DocumentProcessor_float.format(Math.max(customTextLight || txtSet.lightnessLimit, 0.9))})`
            ];
        }
        else {
            const lightSet = this.shift.Image;
            filterValue = [
                lightSet.saturationLimit < 1 ? `saturate(${lightSet.saturationLimit})` : "",
                applyContentFilter ? `var(--${FilterType.ContentFilter})` : "",
                lightSet.lightnessLimit < 1 ? `brightness(${lightSet.lightnessLimit})` : ""
            ];
        }
        roomRules.filter = { value: filterValue.filter(f => f).join(" ").trim() };
    }
    calculateTransition(transitionProperty) {
        let hasForbiddenTransition = false;
        const newTransProps = transitionProperty.split(", ");
        transitionProperty.split(", ").forEach((prop, index) => {
            if (this._transitionForbiddenProperties.has(prop)) {
                newTransProps[index] = `-${prop}`;
                hasForbiddenTransition = true;
            }
        });
        return { hasForbiddenTransition, newTransProps };
    }
    changeColor({ role: component, property: property, tag: tag, bgLight: bgLight, propVal: propVal }) {
        if (tag.mlComputedStyle) {
            let propRole = cc[tag.mlComputedStyle.getPropertyValue(`--ml-${cc[component].replace("$", "-").toLowerCase()}-${property}`)];
            propRole = propRole !== undefined ? propRole : component;
            propVal = propVal || tag.mlComputedStyle.getPropertyValue(property);
            let bgLightVal = 1;
            switch (propRole) {
                case cc.Background:
                    return this._backgroundColorProcessor.changeColor(propVal, true, tag, this._boundParentBackgroundGetter);
                case cc.BackgroundNoContrast:
                    return this._backgroundColorProcessor.changeColor(propVal, false, tag, this._boundParentBackgroundGetter);
                case cc.ButtonBackground:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._buttonBackgroundColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.HighlightedBackground:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._highlightedBackgroundColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.Text:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._textColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.TextShadow:
                    return this._textShadowColorProcessor.changeColor(propVal, bgLight, tag);
                case cc.HighlightedText:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._highlightedTextColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.Link:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._linkColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.Link$Active:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._activeLinkColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.Link$Hover:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._hoverLinkColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.VisitedLink:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._visitedLinkColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.VisitedLink$Active:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._activeVisitedLinkColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.VisitedLink$Hover:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._hoverVisitedLinkColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.Border:
                    bgLightVal = bgLight !== undefined ? bgLight : this.getParentBackground(tag).light;
                    return this._borderColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.ButtonBorder:
                    bgLightVal = this.getParentBackground(tag).light;
                    return this._buttonBorderColorProcessor.changeColor(propVal, bgLightVal, tag);
                case cc.SvgBackground:
                    return this._svgColorProcessor.changeColor(propVal, false, tag, this._boundParentBackgroundGetter);
                case cc.TextSelection:
                    return this._textSelectionColorProcessor.changeColor(propVal, false, tag, this._boundParentBackgroundGetter);
                case cc.None:
                    return this._noneColorProcessor.changeColor(propVal);
            }
        }
        return undefined;
    }
    processBackgroundImagesAndGradients(tag, doc, roomRules, isButton, bgInverted) {
        let backgroundImage = tag.mlComputedStyle.backgroundImage;
        let bgImgLight = 1, doInvert = false, isPseudoContent = false, bgFilter = "", haveToProcBgImg = false, haveToProcBgGrad = /gradient/gi.test(backgroundImage);
        if (/\burl\(/gi.test(backgroundImage)) {
            const customBgImageRole = tag.mlComputedStyle.getPropertyValue(`--ml-${cc[cc.BackgroundImage].toLowerCase()}`);
            const bgImgSet = this.shift[customBgImageRole] || this.shift.BackgroundImage;
            const hasRepeats = !/^(?:,?\s?no-repeat)+$/i.test(tag.mlComputedStyle.backgroundRepeat) &&
                !/cover|contain|%|^(?:,?\s?\d+\dpx)+$/i.test(tag.mlComputedStyle.backgroundSize) &&
                !/-|\d+\dpx/i.test(tag.mlComputedStyle.backgroundPosition) &&
                !notTextureRegExp.test(backgroundImage + tag.className);
            doInvert = !hasRepeats && bgInverted && !tag.style.backgroundImage &&
                !doNotInvertRegExp.test(backgroundImage + tag.className) &&
                tag.mlComputedStyle.getPropertyValue("--ml-no-invert") !== true.toString() &&
                this.tagIsSmall(tag);
            if (bgImgSet.lightnessLimit < 1 || bgImgSet.saturationLimit < 1 ||
                doInvert || this._settingsManager.currentSettings.blueFilter !== 0 ||
                hasRepeats && this.shift.Background.lightnessLimit < 1) {
                isPseudoContent = tag.isPseudo && tag.mlComputedStyle.content !== "''" && tag.mlComputedStyle.content !== '""';
                if (bgImgSet.lightnessLimit < 1 && !doInvert && !hasRepeats) {
                    this.calcTagArea(tag);
                    const area = 1 - Math.min(Math.max(tag.mlArea, 1) / doc.viewArea, 1), lim = bgImgSet.lightnessLimit, txtLim = this.shift.Text.lightnessLimit;
                    bgImgLight = Math.min(Math.pow((Math.pow((Math.pow(lim, (1 / 2)) - lim), (1 / 3)) * area), 3) + lim, Math.max(lim, txtLim));
                }
                else if (hasRepeats) {
                    bgImgLight = this.shift.Background.lightnessLimit;
                }
                bgFilter = [
                    bgImgSet.saturationLimit < 1 ? `saturate(${bgImgSet.saturationLimit})` : "",
                    bgImgLight < 1 && !doInvert ? `brightness(${DocumentProcessor_float.format(bgImgLight)})` : "",
                    doInvert ? `brightness(${DocumentProcessor_float.format(1 - this.shift.Background.lightnessLimit)})` : "",
                    doInvert ? "hue-rotate(180deg) invert(1)" : "",
                    this._settingsManager.currentSettings.blueFilter !== 0 ? `var(--${FilterType.BlueFilter})` : ""
                ].filter(f => f).join(" ").trim();
                haveToProcBgImg = tag instanceof Element && !!tag.firstChild || isPseudoContent ||
                    haveToProcBgGrad || roomRules.backgroundColor && !!roomRules.backgroundColor.color ||
                    tag instanceof HTMLInputElement || tag instanceof HTMLTextAreaElement ||
                    tag instanceof HTMLBodyElement || tag instanceof HTMLHtmlElement;
                if (haveToProcBgImg) {
                    roomRules.attributes = roomRules.attributes || new Map();
                    roomRules.attributes.set("ml-bg-image", "");
                }
                else {
                    roomRules.filter = { value: bgFilter };
                }
            }
        }
        if (haveToProcBgImg || haveToProcBgGrad) {
            if (roomRules.hasBackgroundImageSet = /image-set\(/gi.test(backgroundImage)) {
                backgroundImage = backgroundImage.replace(/[\w-]*image-set\(/, "");
            }
            const gradientColorMatches = backgroundImage
                .match(/rgba?\([^)]+\)|(color-stop|from|to)\((rgba?\([^)]+\)|[^)]+)\)|calc\([^)]+\)/gi);
            const gradientColors = new Map();
            if (gradientColorMatches) {
                gradientColorMatches.forEach(color => gradientColors.set(color, Math.random().toString()));
                gradientColors.forEach((id, color) => backgroundImage =
                    backgroundImage.replace(new RegExp(escapeRegex(color), "g"), id));
            }
            const backgroundImages = backgroundImage.match(/\burl\(\"[^"]+\"\)|[\w-]+\([^)]+\)/gi);
            roomRules.backgroundImages = backgroundImages.map((bgImg, index) => {
                gradientColors.forEach((id, color) => bgImg = bgImg.replace(new RegExp(id, "g"), color));
                if (haveToProcBgImg && bgImg.startsWith("url")) {
                    return this._backgroundImageProcessor.process(bgImg, bgFilter, this._settingsManager.currentSettings.blueFilter / 100, roomRules);
                }
                else if (!this._settingsManager.isFilter && /gradient/gi.test(bgImg)) {
                    return this.processBackgroundGradient(tag, isButton, index, bgImg, roomRules);
                }
                else {
                    return new BackgroundImage(bgImg, BackgroundImageType.Image);
                }
            });
            if (!roomRules.hasBackgroundImagePromises) {
                delete roomRules.filter;
            }
        }
    }
    processBackgroundGradient(tag, isButton, index, gradient, roomRules) {
        let mainColor = null, lightSum = 0;
        let uniqColors = new Set(gradient
            .replace(/webkit|moz|ms|repeating|linear|radial|from|\bto\b|gradient|circle|ellipse|top|left|bottom|right|farthest|closest|side|corner|current|color|transparent|stop|calc|[\.\d]+%|[\.\d]+[a-z]{2,4}/gi, '')
            .match(/(rgba?\([^\)]+\)|#[a-z\d]{6}|[a-z]+)/gi) || []);
        const bgLight = isButton
            ? this._settingsManager.isComplex
                ? this.getParentBackground(tag).light
                : this.shift.Background.lightnessLimit
            : roomRules.backgroundColor
                ? roomRules.backgroundColor.light
                : this.shift.Background.lightnessLimit;
        if (uniqColors.size > 0) {
            uniqColors.forEach(c => {
                let prevColor = /rgb/gi.test(c) ? c : this._colorConverter.convert(c);
                let newColor;
                if (isButton) {
                    newColor = this.changeColor({
                        role: cc.ButtonBackground, property: this._css.backgroundColor,
                        tag: tag,
                        propVal: prevColor,
                        bgLight: bgLight
                    });
                }
                else {
                    newColor = this.changeColor({
                        role: cc.BackgroundNoContrast, property: this._css.backgroundColor,
                        tag: tag,
                        propVal: prevColor,
                        bgLight: bgLight
                    });
                }
                lightSum += newColor.light;
                if (newColor.color ||
                    newColor.reason === ColorReason.Inherited && newColor.intendedColor) {
                    gradient = gradient.replace(new RegExp(escapeRegex(c), "gi"), newColor.color || newColor.intendedColor);
                }
                if (!mainColor && newColor.alpha > 0.5 && roomRules.backgroundColor &&
                    newColor.role === (isButton ? cc.ButtonBackground : cc.BackgroundNoContrast)) {
                    mainColor = roomRules.backgroundColor = Object.assign({}, roomRules.backgroundColor);
                    mainColor.light = newColor.light;
                }
            });
            mainColor && (mainColor.light = lightSum / uniqColors.size);
        }
        return new BackgroundImage(gradient, BackgroundImageType.Gradient);
    }
    applyBackgroundImages(tag, hasBackgroundImageSet, backgroundImages) {
        let originalState = this._documentObserver.stopDocumentObservation(tag.ownerDocument);
        let bgImages = backgroundImages.map((bgImg, ix) => bgImg.data + (hasBackgroundImageSet ? ` ${ix + 1}x` : ""))
            .join(",");
        if (hasBackgroundImageSet) {
            bgImages = `-webkit-image-set(${bgImages})`;
        }
        tag.style.setProperty(this._css.backgroundImage, bgImages, this._css.important);
        this._documentObserver.startDocumentObservation(tag.ownerDocument, originalState);
        return tag;
    }
    removeDynamicValuesStyle(doc) {
        const dynamicStyle = doc.getElementById("midnight-lizard-dynamic-values");
        dynamicStyle && dynamicStyle.remove();
        this._svgFilters.removeSvgFilters(doc);
    }
    createPseudoStyles(doc) {
        if (!doc.mlPseudoStyles) {
            doc.mlPseudoStyles = doc.createElement('style');
            doc.mlPseudoStyles.id = "midnight-lizard-pseudo-styles";
            doc.mlPseudoStyles.mlIgnore = true;
            doc.mlPseudoStyles.textContent = this.getStandardPseudoStyles();
            (doc.head || doc.documentElement).appendChild(doc.mlPseudoStyles);
        }
    }
    getStandardPseudoStyles() {
        const css = new Array();
        for (let pseudoType of getEnumNames(PseudoType)) {
            for (let pseudoStandard of getEnumValues(PseudoStyleStandard)) {
                const cssText = this._standardPseudoCssTexts.get(pseudoStandard);
                const pseudo = pseudoType.toLowerCase();
                const standard = PseudoStyleStandard[pseudoStandard].replace(/(\B[A-Z])/g, "-$1").toLowerCase();
                this._pseudoStyles.set(pseudo + cssText, standard);
                css.push(`[${pseudo}-style="${standard}"]:not(imp)::${pseudo}{${cssText}}`);
            }
        }
        return css.join("\n");
    }
    clearPseudoStyles(doc) {
        this._pseudoStyles.clear();
        if (doc.mlPseudoStyles) {
            doc.mlPseudoStyles.textContent = this.getStandardPseudoStyles();
        }
    }
    calculateMainColors(doc) {
        this.calculateDefaultColors(doc, cx.Link, cx.Black);
        doc.documentElement.mlArea = 1;
        const ignoreBlueFilter = this._settingsManager.isFilter;
        const bgLight = this.shift.Background.lightnessLimit, textColorEntry = this._textColorProcessor.changeColor(cx.Black, bgLight, doc.documentElement, ignoreBlueFilter), scrollbarSizeNum = this._settingsManager.currentSettings.scrollbarSize;
        let backgroundColor = this._backgroundColorProcessor.changeColor(cx.White, true, doc.documentElement, undefined, ignoreBlueFilter).color, altBackgroundColor = this._backgroundColorProcessor.changeColor("rgb(250,250,250)", true, doc.documentElement, undefined, ignoreBlueFilter).color, transBackgroundColor = this._backgroundColorProcessor.changeColor("rgba(255,255,255,0.5)", true, doc.documentElement, undefined, ignoreBlueFilter).color, transAltBackgroundColor = this._backgroundColorProcessor.changeColor("rgba(250,250,250,0.3)", true, doc.documentElement, undefined, ignoreBlueFilter).color, textColor = textColorEntry.color, transTextColor = this._textColorProcessor.changeColor("rgba(0,0,0,0.6)", bgLight, doc.documentElement, ignoreBlueFilter).color, textColorFiltered = this._textColorProcessor.changeColor(cx.Black, bgLight, doc.documentElement).color, borderColor = this._borderColorProcessor.changeColor(cx.Gray, bgLight, doc.documentElement, ignoreBlueFilter).color, transBorderColor = this._borderColorProcessor.changeColor("rgba(127,127,127,0.3)", bgLight, doc.documentElement, ignoreBlueFilter).color, selectionColor = this._textSelectionColorProcessor.changeColor(cx.White, false, doc.documentElement, undefined, ignoreBlueFilter).color, selectionTextColor = cx.White, selectionShadowColor = new cx(0, 0, 0, 0.8).toString(), rangeFillColor = this._rangeFillColorProcessor.changeColor(this.shift, textColorEntry.light, bgLight, ignoreBlueFilter).color, buttonBackgroundColor = this._buttonBackgroundColorProcessor.changeColor(cx.White, bgLight, doc.documentElement, ignoreBlueFilter).color, redButtonBackgroundColor = this._buttonBackgroundColorProcessor.changeColor("rgb(255,0,0)", bgLight, doc.documentElement, ignoreBlueFilter).color, buttonBorderColor = this._buttonBorderColorProcessor.changeColor(cx.White, bgLight, doc.documentElement, ignoreBlueFilter).color, scrollbarThumbHoverColor = this._scrollbarHoverColorProcessor.changeColor(cx.White, bgLight, doc.documentElement, ignoreBlueFilter).color, scrollbarThumbNormalColor = this._scrollbarNormalColorProcessor.changeColor(cx.White, bgLight, doc.documentElement, ignoreBlueFilter).color, scrollbarThumbActiveColor = this._scrollbarActiveColorProcessor.changeColor(cx.White, bgLight, doc.documentElement, ignoreBlueFilter).color, scrollbarTrackColor = backgroundColor, scrollbarShadowColor = new cx(0, 0, 0, 0.3).toString(), scrollbarSize = `${scrollbarSizeNum}px`, scrollbarMarksColor = textColor, scrollbarMarksColorFiltered = textColorFiltered, scrollbarThumbHoverColorFiltered = this._scrollbarHoverColorProcessor.changeColor(cx.White, bgLight, doc.documentElement).color, scrollbarThumbNormalColorFiltered = this._scrollbarNormalColorProcessor.changeColor(cx.White, bgLight, doc.documentElement).color, scrollbarThumbActiveColorFiltered = this._scrollbarActiveColorProcessor.changeColor(cx.White, bgLight, doc.documentElement).color, scrollbarTrackColorFiltered = this._backgroundColorProcessor.changeColor(cx.White, false, doc.documentElement).color, linkColor = this._linkColorProcessor.changeColor(cx.Link, bgLight, doc.documentElement, ignoreBlueFilter).color, linkColorHover = this._hoverLinkColorProcessor.changeColor(cx.Link, bgLight, doc.documentElement, ignoreBlueFilter).color, linkColorActive = this._activeLinkColorProcessor.changeColor(cx.Link, bgLight, doc.documentElement, ignoreBlueFilter).color, visitedColor = this._visitedLinkColorProcessor.changeColor(cx.Link, bgLight, doc.documentElement, ignoreBlueFilter).color, visitedColorHover = this._hoverVisitedLinkColorProcessor.changeColor(cx.Link, bgLight, doc.documentElement, ignoreBlueFilter).color, visitedColorActive = this._activeVisitedLinkColorProcessor.changeColor(cx.Link, bgLight, doc.documentElement, ignoreBlueFilter).color;
        let mozScrollbarWidth = 'auto';
        if (scrollbarSizeNum === 0) {
            mozScrollbarWidth = 'none';
        }
        else if (scrollbarSizeNum < 10) {
            mozScrollbarWidth = 'thin';
        }
        delete doc.documentElement.mlArea;
        this._backgroundColorProcessor.clear();
        const backgroundColorFiltered = this._backgroundColorProcessor.changeColor(cx.White, true, doc.documentElement).color, altBackgroundColorFiltered = this._backgroundColorProcessor.changeColor("rgb(250,250,250)", true, doc.documentElement).color;
        delete doc.documentElement.mlArea;
        this._backgroundColorProcessor.clear();
        const mainColors = {
            backgroundColor, backgroundColorFiltered,
            altBackgroundColor, altBackgroundColorFiltered,
            transBackgroundColor, transAltBackgroundColor,
            textColor, transTextColor, textColorFiltered,
            borderColor, transBorderColor, rangeFillColor,
            selectionColor, selectionTextColor, selectionShadowColor,
            buttonBackgroundColor, buttonBorderColor, redButtonBackgroundColor,
            scrollbarThumbHoverColor, scrollbarThumbNormalColor, scrollbarThumbActiveColor,
            scrollbarTrackColor, scrollbarMarksColor, scrollbarShadowColor,
            scrollbarSize, mozScrollbarWidth, mozScrollbarTrackColor: altBackgroundColor,
            linkColor, linkColorHover, linkColorActive,
            visitedColor, visitedColorHover, visitedColorActive,
            scrollbarMarksColorOriginal: textColor,
            scrollbarThumbHoverColorOriginal: scrollbarThumbHoverColor,
            scrollbarThumbNormalColorOriginal: scrollbarThumbNormalColor,
            scrollbarThumbActiveColorOriginal: scrollbarThumbActiveColor,
            scrollbarTrackColorOriginal: scrollbarTrackColor,
            mozScrollbarTrackColorOriginal: altBackgroundColor,
            scrollbarShadowColorOriginal: scrollbarShadowColor,
            scrollbarMarksColorFiltered,
            scrollbarThumbHoverColorFiltered,
            scrollbarThumbNormalColorFiltered,
            scrollbarThumbActiveColorFiltered,
            scrollbarTrackColorFiltered,
            mozScrollbarTrackColorFiltered: altBackgroundColorFiltered,
            scrollbarShadowColorFiltered: scrollbarShadowColor
        };
        this._onMainColorsCalculated.raise(mainColors);
        return mainColors;
    }
    injectDynamicValues(doc) {
        this._settingsManager.computeProcessingMode(doc, false);
        const mainColors = this.calculateMainColors(doc), invertColors = this._settingsManager.isFilter &&
            this.shift.Background.lightnessLimit < 0.5;
        this._svgFilters.createSvgFilters(doc, mainColors.backgroundColor, mainColors.textColor);
        let cssText = "";
        for (const color in mainColors) {
            let colorValue = mainColors[color];
            if (invertColors && !/Size|Width|Filtered/.test(color)) {
                colorValue = BaseColorProcessor.invertColor(colorValue);
            }
            const colorVarName = color.replace(/([A-Z])/g, "-$1").toLowerCase();
            cssText += `\n--ml-main-${colorVarName}:${colorValue};`;
        }
        let component, property;
        for (component in this.shift) {
            for (property in this.shift[component]) {
                cssText += `\n--ml${component.replace("$", "").replace(/([A-Z])/g, "-$1")}-${property.replace(/([A-Z])/g, "-$1")}:${this.shift[component][property]};`.toLowerCase();
            }
        }
        cssText += `\n--ml-browser:${this._app.browserName}!important;`;
        cssText += `\n--ml-app-id:${this._app.id};`;
        cssText += `\n--ml-version:${this._app.version};`;
        if (this._settingsManager.currentSettings.blueFilter > 0 ||
            this.shift.Text.graySaturation > colorOverlayLimit ||
            this.shift.Background.graySaturation > colorOverlayLimit) {
            cssText += `\n--${FilterType.ContentFilter}:url("#${FilterType.ContentFilter}");`;
        }
        else {
            cssText += `\n--${FilterType.ContentFilter}:'';`;
        }
        if (this._settingsManager.currentSettings.blueFilter > 0) {
            cssText += `\n--${FilterType.BlueFilter}:url("#${FilterType.BlueFilter}");`;
        }
        else {
            cssText += `\n--${FilterType.BlueFilter}:'';`;
        }
        cssText += `\n--${FilterType.PdfFilter}:url("#${FilterType.PdfFilter}");`;
        cssText += `\n--ml-invert:${this.shift.Background.lightnessLimit < 0.3 ? 1 : 0}!important;`;
        cssText += `\n--ml-is-active:${this._settingsManager.isActive ? 1 : 0}!important;`;
        const fakeCanvas = doc.createElement("canvas"), fakeCanvasRules = {};
        fakeCanvas.mlComputedStyle = fakeCanvas.style;
        for (const [contentType, ignoreContentInvertRule] of [["", true], ["-dynamic-content", false]]) {
            this.processInaccessibleTextContent({
                tag: fakeCanvas, roomRules: fakeCanvasRules,
                strictBgLight: true, ignoreContentInvertRule
            });
            cssText += `\n--ml${contentType}-text-filter:${fakeCanvasRules.filter.value};`;
            this.processInaccessibleTextContent({
                tag: fakeCanvas, roomRules: fakeCanvasRules,
                ignoreContentInvertRule
            });
            cssText += `\n--ml${contentType}-contrast-text-filter:${fakeCanvasRules.filter.value};`;
            this.processInaccessibleTextContent({
                tag: fakeCanvas, roomRules: fakeCanvasRules,
                strictBgLight: true, customTextLight: 1, ignoreContentInvertRule
            });
            cssText += `\n--ml${contentType}-highlighted-text-filter:${fakeCanvasRules.filter.value};`;
        }
        let imgSet = this.shift.Image;
        const imgFilter = [
            imgSet.saturationLimit < 1 ? `saturate(${imgSet.saturationLimit})` : "",
            this._settingsManager.currentSettings.blueFilter !== 0 ? `var(--${FilterType.BlueFilter})` : "",
            imgSet.lightnessLimit < 1 ? `brightness(${imgSet.lightnessLimit})` : ""
        ].filter(f => f).join(" ").trim();
        cssText += `\n--ml-image-filter:${imgFilter || 'none'};`;
        const imgRevertFilter = this.GetComponentRevertFilter(imgSet, invertColors);
        cssText += `\n--ml-image-revert-filter:${imgRevertFilter || 'none'};`;
        const bgImgRevertFilter = this.GetComponentRevertFilter(this.shift.BackgroundImage, invertColors);
        cssText += `\n--ml-bg-image-revert-filter:${bgImgRevertFilter || 'none'};`;
        const buttonRevertFilter = this.GetComponentRevertFilter(this.shift.BackgroundImage, invertColors);
        cssText += `\n--ml-button-revert-filter:${buttonRevertFilter || 'none'};`;
        const textRevertFilter = this.GetComponentRevertFilter(this.shift.Text, invertColors);
        cssText += `\n--ml-text-revert-filter:${textRevertFilter || 'none'};`;
        const videoRevertFilter = this.GetComponentRevertFilter(this.shift.Video, invertColors);
        cssText += `\n--ml-video-revert-filter:${videoRevertFilter || 'none'};`;
        const bgRevertFilter = this.GetComponentRevertFilter(this.shift.Background, invertColors);
        cssText += `\n--ml-bg-revert-filter:${bgRevertFilter || 'none'};`;
        const mainColorsStyle = doc.createElement('style');
        mainColorsStyle.id = "midnight-lizard-dynamic-values";
        mainColorsStyle.mlIgnore = true;
        mainColorsStyle.textContent = `:root { ${cssText} }`;
        (doc.head || doc.documentElement).appendChild(mainColorsStyle);
    }
    GetComponentRevertFilter(cmpShift, invertComponent) {
        let cmpLight = cmpShift.lightnessLimit + 1 - Math.max(this.shift.Text.lightnessLimit, 0.9), cmpSat = cmpShift.saturationLimit + 1 - this.shift.Background.saturationLimit;
        if (this.shift.Background.lightnessLimit < 0.5 && !invertComponent) {
            cmpLight = 1;
        }
        const cmpRevertFilter = [
            cmpSat !== 1 ? `saturate(${cmpSat})` : "",
            cmpLight !== 1 ? `brightness(${cmpLight})` : "",
            invertComponent ? `hue-rotate(180deg) invert(1)` : "",
        ].filter(f => f).join(" ").trim();
        return cmpRevertFilter;
    }
    processMetaTheme(doc) {
        if (doc.head && this._settingsManager.currentSettings.changeBrowserTheme) {
            let metaTheme = doc.querySelector('meta[name="theme-color"]');
            let originalColor = "rgb(240,240,240)";
            if (!metaTheme) {
                metaTheme = doc.createElement("meta");
                metaTheme.name = "theme-color";
                doc.head.appendChild(metaTheme);
            }
            else {
                originalColor = this._colorConverter.convert(metaTheme.content) || originalColor;
                metaTheme.originalColor = metaTheme.content;
            }
            const rgbColorString = this._buttonBackgroundColorProcessor.changeColor(originalColor, this.shift.Background.lightnessLimit, metaTheme).color;
            metaTheme.content = RgbaColor.toHexColorString(rgbColorString);
        }
    }
    restoreMetaTheme(doc) {
        let metaTheme = doc.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            if (metaTheme.originalColor) {
                metaTheme.content = metaTheme.originalColor;
            }
            else {
                metaTheme.remove();
            }
        }
    }
    createPageScript(doc) {
        try {
            if (!doc.getElementById("midnight-lizard-page-script")) {
                const pageScript = doc.createElement("script");
                pageScript.id = "midnight-lizard-page-script";
                pageScript.type = "text/javascript";
                pageScript.src = this._app.getFullPath("/js/page-script.js");
                (doc.head || doc.documentElement).appendChild(pageScript);
            }
        }
        catch (ex) {
            this._app.isDebug && console.error(ex);
        }
    }
    removePageScript(doc) {
        let pageScript = doc.getElementById("midnight-lizard-page-script");
        pageScript && pageScript.remove();
    }
    applyRoomRules(tag, roomRules, _ns) {
        let isSvg = tag instanceof SVGElement;
        let applyBgPromise;
        let ns = USP.htm;
        ns = _ns || (isSvg ? USP.svg : USP.htm);
        if (tag instanceof Element) {
            if (roomRules.attributes && roomRules.attributes.size > 0) {
                roomRules.attributes.forEach((attrValue, attrName) => tag.setAttribute(attrName, attrValue));
            }
        }
        if (roomRules.transitionProperty && roomRules.transitionProperty.value) {
            tag.originalTransitionProperty = tag.style.transitionProperty;
            tag.style.setProperty(this._css.transitionProperty, roomRules.transitionProperty.value, this._css.important);
        }
        if (roomRules.filter && roomRules.filter.value) {
            tag.originalFilter = tag.style.filter;
            tag.currentFilter = roomRules.filter.value;
            if (tag.isPseudo) {
                tag.style.setProperty(this._css.filter, roomRules.filter.value, this._css.important);
            }
            else {
                tag.style.setProperty(this._css.filter, roomRules.filter.value);
            }
        }
        if (roomRules.backgroundImages) {
            tag.originalBackgroundImage = tag.style.backgroundImage;
            if (roomRules.hasBackgroundImagePromises) {
                applyBgPromise = Promise.all([tag, tag.mlTimestamp, roomRules.hasBackgroundImageSet, ...roomRules.backgroundImages])
                    .then(([t, timestamp, hasBackgroundImageSet, ...bgImgs]) => {
                    if (t.mlTimestamp === timestamp) {
                        return this.applyBackgroundImages(t, hasBackgroundImageSet, bgImgs);
                    }
                    return t;
                });
                applyBgPromise.catch(ex => {
                    if (this._app.isDebug) {
                        console.error(`Faild to fetch background image\n${ex}`);
                    }
                });
            }
            else {
                this.applyBackgroundImages(tag, roomRules.hasBackgroundImageSet, roomRules.backgroundImages);
            }
        }
        if (roomRules.textShadow && roomRules.textShadow.value) {
            tag.originalTextShadow = tag.style.textShadow;
            tag.style.setProperty(ns.css.shdColor, roomRules.textShadow.value, this._css.important);
        }
        if (roomRules.display) {
            tag.originalDisplay = tag.style.display;
            tag.style.setProperty(this._css.display, roomRules.display, this._css.important);
        }
        if (roomRules.backgroundColor && roomRules.backgroundColor.color) {
            if (tag instanceof HTMLElement && (tag.isEditableContent ||
                tag.isEditableContent === undefined && this.isEditableContent(tag))) {
                tag.style.setProperty(this._css.editableContentBackgroundColor, roomRules.backgroundColor.color);
            }
            else {
                tag.originalBackgroundColor = tag.style.getPropertyValue(ns.css.bgrColor);
                tag.style.setProperty(ns.css.bgrColor, roomRules.backgroundColor.color, this._css.important);
            }
        }
        if (roomRules.placeholderColor && roomRules.placeholderColor.color) {
            tag.style.setProperty(this._css.placeholderColor, roomRules.placeholderColor.color, this._css.important);
        }
        if (roomRules.color && (roomRules.color.color ||
            tag instanceof HTMLElement && tag.contentEditable === true.toString())) {
            if (tag instanceof HTMLElement && (tag.isEditableContent ||
                tag.isEditableContent === undefined && this.isEditableContent(tag))) {
                tag.style.setProperty(this._css.editableContentColor, roomRules.color.color ||
                    roomRules.color.intendedColor || roomRules.color.inheritedColor || cx.Black);
            }
            else {
                tag.originalColor = tag.style.getPropertyValue(ns.css.fntColor);
                tag.style.setProperty(ns.css.fntColor, roomRules.color.color, this._css.important);
            }
        }
        else if (roomRules.color && (roomRules.color.reason === ColorReason.Inherited) && tag.style.getPropertyValue(ns.css.fntColor)) {
            tag.originalColor = "";
        }
        if (roomRules.linkColor && roomRules.linkColor.color) {
            tag.style.setProperty(this._css.linkColor, roomRules.linkColor.color, this._css.important);
            tag.style.setProperty(this._css.linkColorHover, roomRules.linkColor$Hover.color, this._css.important);
            tag.style.setProperty(this._css.linkColorActive, roomRules.linkColor$Avtive.color, this._css.important);
        }
        if (roomRules.visitedColor && roomRules.visitedColor.color) {
            tag.style.setProperty(this._css.visitedColor, roomRules.visitedColor.color, this._css.important);
            tag.style.setProperty(this._css.visitedColorHover, roomRules.visitedColor$Hover.color, this._css.important);
            tag.style.setProperty(this._css.visitedColorActive, roomRules.visitedColor$Active.color, this._css.important);
        }
        if (tag instanceof HTMLElement && (tag.isEditableContent ||
            tag.isEditableContent === undefined && this.isEditableContent(tag))) {
            tag.style.setProperty(this._css.originalColor, tag.originalColor ||
                roomRules.color && roomRules.color.originalColor || cx.Black);
            tag.style.setProperty(this._css.originalBackgroundColor, tag.originalBackgroundColor ||
                roomRules.backgroundColor && roomRules.backgroundColor.originalColor !== cx.Transparent &&
                    roomRules.backgroundColor.originalColor ||
                this.getParentBackground(tag).originalColor || cx.White);
        }
        if (roomRules.borderColor && roomRules.borderColor.color) {
            tag.originalBorderColor = tag.style.getPropertyValue(ns.css.brdColor);
            tag.style.setProperty(ns.css.brdColor, roomRules.borderColor.color, this._css.important);
        }
        else {
            if (roomRules.borderTopColor && roomRules.borderTopColor.color) {
                tag.originalBorderTopColor = tag.style.borderTopColor;
                tag.style.setProperty(this._css.borderTopColor, roomRules.borderTopColor.color, this._css.important);
            }
            if (roomRules.borderRightColor && roomRules.borderRightColor.color) {
                tag.originalBorderRightColor = tag.style.borderRightColor;
                tag.style.setProperty(this._css.borderRightColor, roomRules.borderRightColor.color, this._css.important);
            }
            if (roomRules.borderBottomColor && roomRules.borderBottomColor.color) {
                tag.originalBorderBottomColor = tag.style.borderBottomColor;
                tag.style.setProperty(this._css.borderBottomColor, roomRules.borderBottomColor.color, this._css.important);
            }
            if (roomRules.borderLeftColor && roomRules.borderLeftColor.color) {
                tag.originalBorderLeftColor = tag.style.borderLeftColor;
                tag.style.setProperty(this._css.borderLeftColor, roomRules.borderLeftColor.color, this._css.important);
            }
        }
        if (tag instanceof PseudoElement) {
            if (applyBgPromise) {
                applyBgPromise.then(x => x.applyStyleChanges());
                Promise.all([tag, applyBgPromise.catch(ex => ex)]).then(([t]) => t.applyStyleChanges());
            }
            else {
                let cssText = tag.style.cssText;
                if (cssText) {
                    const pseudoKey = tag.tagName + cssText;
                    const pseudoId = this._pseudoStyles.get(pseudoKey);
                    if (pseudoId) {
                        cssText = "";
                    }
                    else {
                        this._pseudoStyles.set(pseudoKey, tag.id);
                    }
                    tag.parentElement.setAttribute(`${tag.tagName}-style`, pseudoId || tag.id);
                }
                tag.applyStyleChanges(cssText);
            }
        }
        if (tag instanceof Element && tag.onRoomRulesApplied) {
            tag.onRoomRulesApplied.raise(roomRules);
        }
    }
};
DocumentProcessor = DocumentProcessor_1 = __decorate([
    injectable(IDocumentProcessor),
    __metadata("design:paramtypes", [CssStyle,
        Document,
        CurrentExtensionModule,
        IApplicationSettings,
        IBaseSettingsManager,
        IPreloadManager,
        IDocumentObserver,
        IStyleSheetProcessor,
        IBackgroundColorProcessor,
        IButtonBackgroundColorProcessor,
        ISvgBackgroundColorProcessor,
        IScrollbarHoverColorProcessor,
        IScrollbarNormalColorProcessor,
        IScrollbarActiveColorProcessor,
        ITextColorProcessor,
        ITextSelectionColorProcessor,
        IHighlightedTextColorProcessor,
        IHighlightedBackgroundColorProcessor,
        ILinkColorProcessor,
        IVisitedLinkColorProcessor,
        IActiveVisitedLinkColorProcessor,
        IHoverVisitedLinkColorProcessor,
        IActiveLinkColorProcessor,
        IHoverLinkColorProcessor,
        ITextShadowColorProcessor,
        IRangeFillColorProcessor,
        IBorderColorProcessor,
        IButtonBorderColorProcessor,
        IColorToRgbaStringConverter,
        IDocumentZoomObserver,
        ISvgFilters,
        IBackgroundImageProcessor,
        INoneColorProcessor])
], DocumentProcessor);

;// CONCATENATED MODULE: ./ts/ContentScript/ContentScriptStarter.ts




Container.register(Document, class {
    constructor() { return document; }
});
Container.register(CurrentExtensionModule, class {
    constructor() {
        return new CurrentExtensionModule(ExtensionModule.ContentScript);
    }
});
class ContentScriptStarter {
    constructor(...registerations) {
        Container.resolve(ISettingsManager);
        Container.resolve(IDocumentProcessor);
    }
}

;// CONCATENATED MODULE: ./ts/Chrome/ChromeContentScriptStarter.ts







new ContentScriptStarter(ChromeApplicationSettings, ChromeStorageManager, ChromeSettingsBus, ChromeCommandManager, ChromeTranslationAccessor, ChromeContentMessageBus);

})();

/******/ })()
;