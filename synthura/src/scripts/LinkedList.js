// node object that stores camera identifier, video Component, and next node in list
class Node {
    constructor(camNum, camComponent) {
      this.id = camNum;
      this.camComponent = camComponent;
      this.next = null;
    }
} 
  
class LinkedList {

    constructor() {
        this.head = null;
    }

    // check if a node with camNum is present in the list
    isPresent(camNum) {
    let current = this.head;
    while(current) {
        if(current.id === camNum) {
            return true;
        }
        current = current.next;
    }
    return false;
    }


    // add a new node to the end of the list
    append(camNum, camComponent) {
        let node = new Node(camNum, camComponent);
        let current;
        if (this.head === null) {
            this.head = node;
        } else {
            current = this.head;
            while (current.next) {
            current = current.next;
            }
            current.next = node;
        }
    }
    
    // remove node specified by camNum from list
    remove(camNum) {
        let current = this.head;
        let previous;
        if (current.id === camNum) {
            this.head = current.next;
        } else {
            while (current && (current.id !== camNum)) {
                previous = current;
                current = current.next;
            }
            if(!current) {
                return;
            }
            previous.next = current.next;
        }
    }
    
    // return an array of camera components
    render() {
        const camList = [];
        let current = this.head;
        while(current) {
            camList.push(current.camComponent);
            current = current.next;
        }
        return camList;
    }
  }
  
  export { Node, LinkedList };
  
  // Very brief test
  
  // const myList = new LinkedList();
  
  // myList.append(1, 'hi');
  // myList.append(2, 'yo');
  // myList.append(3, 'howdy');
  // myList.append(4, 'check');
  // myList.append(5, 'why');
  
  // console.log(myList.render()); // [1, 2, 3, 4]
  
  // myList.remove(1);
  // console.log(myList.render()); // [1, 2, 3]
  // myList.remove(3);
  // console.log(myList.render()); // [1, 2, 3, 4]