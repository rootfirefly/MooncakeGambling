
const NamePoint = {
    "ZYCJH": { label: "状元插金花！！！", image: "zycjh", see: "zycjh" },
    "MTH": { label: "状元！满堂红", image: "lbh" }, // 6bh
    "BDJ": { label: "状元！遍地锦", image: "bdj" },
    "LBH": { label: "状元！六杯黑", image: "lbhei" },
    "WH": { label: "状元！五红", image: "wh" },
    "WZDK": { label: "状元！五子登科", image: "wzdk" },
    "SDH": { label: "状元！四点红", image: "zy" },
    "DuiTang": { label: "对堂", image: "dt" },
    "SanHong": { label: "三红", image: "sh" },
    "SiJin": { label: "四进", image: "sj" },
    "ErJu": { label: "二举", image: "ej" },
    "YiXiu": { label: "一秀", image: "yx" },
}

/**
 * 博饼规则
 */
export class Rule {
    /**
     * 检查中了啥
     * @param pointList 
     * @returns 
     */
    public checkList (pointList: number[]) {
        for (const key in NamePoint) {
            let fun = (this as any)["_check" + key];
            if (fun.call(this, pointList)) {
                //@ts-ignore
                return NamePoint[key];
            }
        }
        return { label: "请再接再厉哦", image: "xmlm", see: "lost" };
    }

    private _checkYiXiu (pointList: []) {
        if (this.countNumber(pointList, 4) == 1) {
            return true
        }
        return false
    }

    private _checkErJu (pointList: []) {
        if (this.countNumber(pointList, 4) == 2) {
            return true
        }
        return false
    }

    private _checkSiJin (pointList: []) {
        let checkList = [1, 2, 3, 5, 6];
        for (let i = 0; i < checkList.length; i++) {
            if (this.countNumber(pointList, checkList[i]) == 4) {
                return true
            }
        }
        return false
    }

    private _checkSanHong (pointList: []) {
        if (this.countNumber(pointList, 4) == 3) {
            return true
        }
        return false
    }

    private _checkDuiTang (pointList: []) {
        let list = pointList.sort();
        for (let i = 0; i < list.length; i++) {
            if (list[i] != i + 1) {
                return false
            }
        }
        return true;
    }

    private _checkSDH (pointList: []) {
        if (this.countNumber(pointList, 4) == 4) {
            return true
        }
        return false
    }

    // 五子登科
    private _checkWZDK (pointList: []) {
        let checkList = [1, 2, 3, 5, 6];
        for (let i = 0; i < checkList.length; i++) {
            if (this.countNumber(pointList, checkList[i]) == 5) {
                return true
            }
        }
        return false
    }

    // 五红
    private _checkWH (pointList: []) {
        if (this.countNumber(pointList, 4) == 5) {
            return true
        }
        return false
    }


    // 
    private _checkLBH (pointList: []) {
        let checkList = [2, 3, 5, 6];
        for (let i = 0; i < checkList.length; i++) {
            if (this.countNumber(pointList, checkList[i]) == 6) {
                return true
            }
        }
        return false
    }

    private _checkBDJ (pointList: []) {
        if (this.countNumber(pointList, 1) == 6) {
            return true
        }
        return false
    }

    private _checkMTH (pointList: []) {
        if (this.countNumber(pointList, 4) == 6) {
            return true
        }
        return false
    }

    private _checkZYCJH (pointList: []) {
        if (this.countNumber(pointList, 4) == 4 && this.countNumber(pointList, 1) == 2) {
            return true
        }
        return false
    }


    /**
     * 计算某个数字出现的次数
     * @param pointList 
     * @param num 
     * @returns 
     */
    public countNumber (pointList: [], num: number) {
        let count = 0;
        pointList.forEach((point) => {
            if (point == num) {
                count++;
            }
        })

        return count;
    }

    /**
     * 结算除xxx数字外的其他数字合
     * @param pointList 
     * @param outNum 
     * @returns 
     */
    public sumOutNumberCount (pointList: [], outNum: number) {
        let count = 0;
        pointList.forEach((point) => {
            if (point == outNum) {

            } else {
                count += outNum;
            }
        });

        return count;
    }
}