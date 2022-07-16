//	eDrum4u
//	Copyright (c) 2021-2022 Johan A. Goossens. All rights reserved.
//
//	This work is licensed under the terms of the MIT license.
//	For a copy, see <https://opensource.org/licenses/MIT>.


#pragma once


//
//	Forward reference (required because of circular dependencies)
//

struct Kit;
struct Scanner;
struct Monitor;


//
//	Context structure
//

struct Context {
	unsigned long now;
	Kit* kit;
	Scanner* scanner;
	Monitor* monitor;
};
