// Source code from the Linux Kernel.
// void show_stack(struct task_struct *task, unsigned long *stack)
// {
// #ifdef CONFIG_PRINTK
// 	unsigned int *addr, *endstack, *fp = 0, *frame;
// 	unsigned short *ins_addr;
// 	char buf[150];
// 	unsigned int i, j, ret_addr, frame_no = 0;
	/*
	 * If we have been passed a specific stack, use that one otherwise
	 *    if we have been passed a task structure, use that, otherwise
	 *    use the stack of where the variable "stack" exists
	 */
	// if (stack == NULL) {
	// 	if (task) {
	// 		/* We know this is a kernel stack, so this is the start/end */
	// 		stack = (unsigned long *)task->thread.ksp;
	// 		endstack = (unsigned int *)(((unsigned int)(stack) & ~(THREAD_SIZE - 1)) + THREAD_SIZE);
	// 	} else {
	// 		/* print out the existing stack info */
	// 		stack = (unsigned long *)&stack;
	// 		endstack = (unsigned int *)PAGE_ALIGN((unsigned int)stack);
	// 	}
	// } else
	// 	endstack = (unsigned int *)PAGE_ALIGN((unsigned int)stack);
	// printk(KERN_NOTICE "Stack info:\n");
	// decode_address(buf, (unsigned int)stack);
	// printk(KERN_NOTICE " SP: [0x%p] %s\n", stack, buf);
  //
	// if (!access_ok(VERIFY_READ, stack, (unsigned int)endstack - (unsigned int)stack)) {
	// 	printk(KERN_NOTICE "Invalid stack pointer\n");
	// 	return;
	// }
	/* First thing is to look for a frame pointer */
	// for (addr = (unsigned int *)((unsigned int)stack & ~0xF); addr < endstack; addr++) {
	// 	if (*addr & 0x1)
	// 		continue;
	// 	ins_addr = (unsigned short *)*addr;
	// 	ins_addr--;
	// 	if (is_bfin_call(ins_addr))
	// 		fp = addr - 1;
  //
	// 	if (fp) {
	// 		/* Let's check to see if it is a frame pointer */
	// 		while (fp >= (addr - 1) && fp < endstack
	// 		       && fp && ((unsigned int) fp & 0x3) == 0)
	// 			fp = (unsigned int *)*fp;
	// 		if (fp == 0 || fp == endstack) {
	// 			fp = addr - 1;
	// 			break;
	// 		}
	// 		fp = 0;
	// 	}
	// }
	// if (fp) {
	// 	frame = fp;
	// 	printk(KERN_NOTICE " FP: (0x%p)\n", fp);
	// } else
	// 	frame = 0;
  //
	/*
	 * Now that we think we know where things are, we
	 * walk the stack again, this time printing things out
	 * incase there is no frame pointer, we still look for
	 * valid return addresses
	 */
