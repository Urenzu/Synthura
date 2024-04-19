class Node {
  constructor(camNum, camComponent) {
    this.camNum = camNum;
    this.camComponent = camComponent;
    this.next = null;
  }
} 

class LinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    append(camNum, camComponent) {
        if(this.isPresent(camNum)) {
            return console.log('Camera already exists');
        }
        console.log("appending camera " + camNum);
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

    isPresent(camNum) {
        let current = this.head;
        while(current) {
            if(current.camNum === camNum) {
                return true;
            }
            current = current.next;
        }
        return false;
    }

    remove(camNum) {
        console.log(`removing camera ${camNum}`);
        if(this.size === 0) return console.log('List is empty');
        let current = this.head;
        let previous;
        if (current.camNum === camNum) {
            this.head = current.next;
        } else {
            while (current && (current.camNum !== camNum)) {
                previous = current;
                current = current.next;
            }
            if(!current) {
                return;
            }
            previous.next = current.next;
        }
        this.size--;
    }

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