var jss = (function (doc) {
    var jss,
        head,
        styleSheets;

    // Shortcuts
    head = doc.head || doc.getElementsByTagName('head')[0];
    styleSheets = doc.styleSheets;
    
    jss = function () {};
    
    jss.get = function (name, targetSheet, action) {
        if (!styleSheets) return [];
        
        var sheets,
            sheet,
            rules,
            result = [],
            actionRet,
            actionArgs,
            argsStart = 3,
            i,
            j;
        
        // Normalise args
        if (typeof targetSheet == 'string') {
            action = targetSheet;
            sheets = styleSheets;
            argsStart--;
        } else {
            sheets = [targetSheet];
        }
        actionArgs = Array.prototype.slice.call(arguments, argsStart);
        name = name.toLowerCase();

        for (i = 0; i < sheets.length; i++) {
            // Get rules for stylesheet, continue if not available
            sheet = sheets[i];
            rules = sheet.cssRules || sheet.rules;
            if (!rules) continue;

            for (j = 0; j < rules.length; j++) {
                if (rules[j].selectorText.toLowerCase() == name) {
                    if (action) {
                        actionRet = jss.actions[action]({
                            args: actionArgs,
                            sheet: sheet,
                            rule: rules[j],
                            rulePos: j
                        });
                        if (actionRet != null) result.push(actionRet);
                    } else {
                        result.push(rules[j]);
                    }
                }
            }
        }

        return result;
    };

    jss.actions = {
        remove: function (o) {
            var sheet = o.sheet,
                pos = o.rulePos;

            if (sheet.deleteRule) {
                sheet.deleteRule(pos);
            } else if (sheet.removeRule) {
                sheet.removeRule(pos);
            }
        },
        set: function (o) {
            var rule = o.rule,
                props = o.args[0];
            if (!props) return;
            for (var i in props) {
                if (!props.hasOwnProperty(i)) continue;
                rule.style[i] = props[i];
            }
        }
    };
    
    jss.create = function (name) {
        if (!styleSheets) return;
        
        var styleNode,
            i;

        // Create own stylesheet for jss styles
        if (!jss.styleSheet) {
            styleNode = doc.createElement('style');
            styleNode.type = 'text/css';
            styleNode.rel = 'stylesheet';
            styleNode.media = 'screen';
            styleNode.title = 'jss';
            head.appendChild(styleNode);
            // Find stylesheet object
            for (i = 0; i < styleSheets.length; i++) {
                if (styleNode === (styleSheets[i].ownerNode
                        || styleSheets[i].owningElement)) {
                    jss.styleSheet = styleSheets[i];
                }
            }
        }
        
        // Add (empty) rule
        if (jss.styleSheet.insertRule) {
            jss.styleSheet.insertRule(name + ' { }', 0);
        } else if (jss.styleSheet.addRule) {
            jss.styleSheet.addRule(name, null, 0);
        }
    };

    return jss;
})(document);
