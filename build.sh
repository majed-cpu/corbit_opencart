#!/bin/sh
# Builds the installable packages:
#   dist/opencart-4/corbit.ocmod.zip      OpenCart 4.0.x - 4.1.x (Extensions > Installer)
#   dist/opencart-3/corbit_sms.ocmod.zip  OpenCart 3.0.x         (Extensions > Installer)
#
# shared/ holds the gateway client, the OTP engine and the language files used by both.
# On OpenCart 4 the zip name ("corbit") becomes the extension code, so do not rename it.
set -e
cd "$(dirname "$0")"

LANGUAGES="en-gb ar"

rm -rf build dist
mkdir -p build dist/opencart-4 dist/opencart-3

# OpenCart 4
cp -R oc4 build/oc4
mkdir -p build/oc4/system/library/corbit/sms
cp shared/library/corbit/sms/*.php build/oc4/system/library/corbit/sms/
for code in $LANGUAGES; do
	mkdir -p "build/oc4/admin/language/$code/module" "build/oc4/catalog/language/$code/module"
	cp "shared/language/admin/$code.php" "build/oc4/admin/language/$code/module/corbit_sms.php"
	cp "shared/language/catalog/$code.php" "build/oc4/catalog/language/$code/module/corbit_sms.php"
done
(cd build/oc4 && zip -q -r -X ../../dist/opencart-4/corbit.ocmod.zip . -x '.*')

# OpenCart 3
cp -R oc3 build/oc3
mkdir -p build/oc3/upload/system/library/corbit/sms
cp shared/library/corbit/sms/*.php build/oc3/upload/system/library/corbit/sms/
for code in $LANGUAGES; do
	mkdir -p "build/oc3/upload/admin/language/$code/extension/module" "build/oc3/upload/catalog/language/$code/extension/module"
	cp "shared/language/admin/$code.php" "build/oc3/upload/admin/language/$code/extension/module/corbit_sms.php"
	cp "shared/language/catalog/$code.php" "build/oc3/upload/catalog/language/$code/extension/module/corbit_sms.php"
done
(cd build/oc3 && zip -q -r -X ../../dist/opencart-3/corbit_sms.ocmod.zip . -x '.*')

rm -rf build
echo "Built:"
ls -1 dist/*/*.zip
