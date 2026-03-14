#include <stdio.h>

int main() {
  int num;
  scanf("%d", &num);

  int check = 1;

  if (num <= 1) {
    check = 0;
  } else {
    for (int i = 2; i * i <= num; i++) {
      if (num % i == 0) {
        check = 0;
        break;
      }
    }
  }

  int temp = num;
  while (temp > 0) {
    int d = temp % 10;

    if (d != 2 && d != 3 && d != 5 && d != 7) {
      check = 0;
      break;
    }

    temp = temp / 10;
  }

  if (check == 1) {
    printf("1\n");
  } else {
    printf("0\n");
  }

  return 0;
}
