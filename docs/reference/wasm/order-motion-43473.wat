  (func (;43473;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    local.get 0
    i32.load offset=72
    local.set 3
    i32.const 0
    local.set 1
    i32.const 4366773
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3387256
      call 2180
      i32.const 3385828
      call 2180
      i32.const 3385832
      call 2180
      i32.const 4366773
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=92
      local.tee 4
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 4
      local.get 0
      i32.load offset=56
      local.tee 5
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 5
      local.get 4
      local.get 2
      i32.const 12
      i32.add
      i32.const 3385832
      i32.load
      call 50458
      local.get 2
      i32.load offset=12
      i32.load offset=12
      local.set 1
    end
    block  ;; label = @1
      local.get 3
      local.get 1
      local.get 0
      i32.load offset=100
      i32.add
      i32.sub
      local.tee 1
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 4367476
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3361216
        call 2180
        i32.const 4367476
        i32.const 1
        i32.store8
      end
      i32.const 3361216
      i32.load
      i32.load offset=92
      i32.load
      local.tee 3
      i32.eqz
      br_if 0 (;@1;)
      local.get 3
      local.get 0
      local.get 0
      i32.load offset=68
      local.get 1
      local.get 0
      call 43419
    end
    local.get 0
    i32.const 0
    i32.store8 offset=129
    i32.const 4367476
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3361216
      call 2180
      i32.const 4367476
      i32.const 1
      i32.store8
    end
    i32.const 3361216
    i32.load
    i32.load offset=92
    i32.load
    local.tee 0
    if  ;; label = @1
      local.get 0
      local.get 0
      call 43412
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0)
