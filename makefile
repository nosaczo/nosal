list:
	@echo "const backgrounds = [$(shell ls images/backgrounds | sed "s/.*/'&'/" | paste -sd, -)];"
	@echo "const templates = [$(shell ls images/templates | sed "s/.*/'&'/" | paste -sd, -)];"
	@echo "const characters = [$(shell ls images/characters | sed "s/.*/'&'/" | paste -sd, -)];"
	@echo "const items = [$(shell ls images/items | sed "s/.*/'&'/" | paste -sd, -)];"

update:
	@script=$$(mktemp); head -n 4 script.js > $$script; { echo "const backgrounds = [$(shell ls images/backgrounds | sed "s/.*/'&'/" | paste -sd, -)];"; echo "const templates = [$(shell ls images/templates | sed "s/.*/'&'/" | paste -sd, -)];"; echo "const characters = [$(shell ls images/characters | sed "s/.*/'&'/" | paste -sd, -)];"; echo "const items = [$(shell ls images/items | sed "s/.*/'&'/" | paste -sd, -)];"; tail -n +5 script.js; } > $$script.tmp; mv $$script.tmp script.js; rm $$script
