export const process = (store, order) => {
    const storeMap = new Map()
    store.forEach(({size, quantity}) => storeMap.set(size, quantity))

    const stats = {}
    const assignment = []

    const [ordersWithOnlyOneSize, arrForLinkedList] = order.reduce(([first, second], curr) => {
        curr.masterSize ? second.push(curr) : first.push(curr)
        return [first, second]
    }, [[], []])

    for(const order of ordersWithOnlyOneSize){
        if(storeMap.get(order.size[0]) > 0) assign(order.size[0], order.id)
        else return false
    }


    const linkedList = {data: arrForLinkedList[0], next: null}
    let current = linkedList
    for (let i = 1; i < arrForLinkedList.length; i++) {
        current.next = { data: arrForLinkedList[i], next: null }
        current = current.next
    }

    if(linkedList.data){
        const result = test(linkedList, new Map(storeMap))
        if(!result) return false
        const finalStats = mergeObjects(stats, result.stats)
        Object.keys(result.assignment).forEach(el => {
            assignment.push({id: Number(el), size: result.assignment[el]})
        })
        
        return{
            stats: Object.keys(finalStats).map(el => {
                return {size: Number(el), quantity: finalStats[el]}
            }),
            assignment,
            mismatches: result.mismatches
        }
    }else{
        return {
            stats: Object.keys(stats).map(el => {
                return {size: Number(el), quantity: stats[el]}
            }),
            assignment,
            mismatches: 0
        }
    }

    function assign(assignedSize, id){
        assignment.push({ id, size: assignedSize })
        storeMap.set(assignedSize, storeMap.get(assignedSize) - 1)
        stats[assignedSize] = (stats[assignedSize] || 0) + 1
    }

    function test(list, store, result = {stats: {}, assignment: {}, mismatches: 0}){
        const temp = []
        for(const item of list.data.size){
            if(store.get(item) > 0){
                const fakeStore = new Map(store)
                const clone = structuredClone(result)
                const firstPriority = list.data.masterSize === 's1' ? list.data.size[0] : list.data.size[1]
                fakeStore.set(item, fakeStore.get(item) - 1)
                clone.stats[item] = (clone.stats[item] || 0) + 1
                clone.assignment[list.data.id] = item
                item != firstPriority && clone.mismatches++
                if(list.next) temp.push(test(list.next, fakeStore, clone))
                else temp.push(clone)
            }else temp.push(false)
        }
        return temp.reduce((acc, curr) => {
            if(acc && curr) acc = curr.mismatches < acc.mismatches ? curr : acc
            else if(!acc && curr) acc = curr
            return acc
        }, false)
    }

    function mergeObjects(base, additional) {
        const result = { ...base }
        for (const key in additional) result[key] = (result[key] || 0) + additional[key]
        return result;
      }
}
