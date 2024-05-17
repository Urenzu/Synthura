
// node object that stores camera identifier, video Component, and next node in list
class Node {
    constructor(camNum, camComponent) {
      this.id = camNum;
      this.camComponent = camComponent;
      this.next = null;
    }
} 

// linked list object for efficiently managing camera components
class LinkedList {

    constructor() {
        this.head = null;
        this.size = 0;
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
        this.size++;
    }
    
    // remove node specified by camNum from list
    remove(camNum) {
        let current = this.head;
        let previous;
        if (current.id === camNum) {
            this.head = current.next;
            current = null;
        } else {
            while (current && (current.id !== camNum)) {
                previous = current;
                current = current.next;
            }
            if(!current) {
                return;
            }
            previous.next = current.next;
            current = null;
        }
        this.size--;
    }

    // return the size of the list
    getSize() {
        return this.size;
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
  
  export { LinkedList };
  