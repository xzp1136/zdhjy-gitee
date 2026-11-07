  (func (;43417;) (type 9) (param i32 i32 i32 i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 0
    local.set 4
    i32.const 4366760
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3387256
      call 2180
      i32.const 3385828
      call 2180
      i32.const 3390456
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3385832
      call 2180
      i32.const 3390460
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4366760
      i32.const 1
      i32.store8
    end
    local.get 2
    i32.const 0
    i32.store
    local.get 3
    i32.const -1
    i32.store
    block  ;; label = @1
      local.get 0
      i32.load8_u offset=77
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      i32.load8_u offset=76
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=64
      local.set 6
      i32.const 3360788
      i32.load
      local.tee 7
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 7
        call 60460
      end
      local.get 6
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=92
      local.tee 6
      i32.const 0
      i32.lt_s
      br_if 0 (;@1;)
      local.get 6
      local.get 0
      i32.load offset=84
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 6
      local.get 0
      i32.load offset=56
      local.tee 7
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=68
      local.get 1
      i32.ne
      br_if 0 (;@1;)
      local.get 7
      local.get 6
      local.get 5
      i32.const 8
      i32.add
      i32.const 3385832
      i32.load
      call 50458
      local.get 3
      local.get 0
      i32.load offset=100
      local.get 5
      i32.load offset=8
      i32.load offset=12
      i32.add
      local.tee 1
      i32.store
      local.get 1
      local.get 0
      i32.load offset=72
      i32.ge_s
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=64
      local.get 0
      i32.load offset=92
      i32.const 1
      i32.add
      i32.const 0
      call 43247
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 3
      i32.load
      local.tee 3
      local.get 1
      i32.load offset=12
      i32.ge_s
      br_if 0 (;@1;)
      local.get 1
      local.get 3
      local.get 5
      i32.const 12
      i32.add
      i32.const 3390460
      i32.load
      call 50458
      local.get 2
      local.get 5
      i32.load offset=12
      local.tee 3
      i32.store
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 3
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      i32.const 1
      local.set 4
      local.get 0
      local.get 0
      i32.load offset=100
      i32.const 1
      i32.add
      i32.store offset=100
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0
    local.get 4)
