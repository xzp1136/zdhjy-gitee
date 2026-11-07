  (func (;44405;) (type 2) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4367413
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375600
      call 2180
      i32.const 3353480
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3387844
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3385856
      call 2180
      i32.const 3432328
      call 2180
      i32.const 4367413
      i32.const 1
      i32.store8
    end
    i32.const 3353480
    i32.load
    i32.const 4
    call 2185
    local.tee 6
    i32.const 3432328
    i32.load
    i32.const 0
    call 52128
    block  ;; label = @1
      local.get 6
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      local.get 1
      i32.eqz
      if  ;; label = @2
        loop  ;; label = @3
          i32.const 3375600
          i32.load
          local.set 2
          local.get 0
          i32.load offset=200
          local.set 5
          local.get 3
          local.get 6
          local.get 4
          i32.const 2
          i32.shl
          i32.add
          i32.const 16
          i32.add
          local.tee 1
          i32.load
          i32.store offset=12
          local.get 3
          i32.const 0
          i32.store offset=8
          local.get 5
          local.get 3
          i32.const 12
          i32.add
          local.get 3
          i32.const 8
          i32.add
          local.get 2
          call 34436
          i32.const 3375600
          i32.load
          local.set 2
          local.get 0
          i32.load offset=204
          local.set 5
          local.get 3
          local.get 1
          i32.load
          i32.store offset=12
          local.get 3
          i32.const 0
          i32.store offset=8
          local.get 5
          local.get 3
          i32.const 12
          i32.add
          local.get 3
          i32.const 8
          i32.add
          local.get 2
          call 34436
          local.get 4
          i32.const 1
          i32.add
          local.tee 4
          local.get 6
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
          br 2 (;@1;)
        end
        unreachable
      end
      loop  ;; label = @2
        i32.const 0
        local.set 2
        block (result i32)  ;; label = @3
          i32.const 0
          local.get 4
          local.get 1
          i32.load offset=12
          i32.ge_s
          br_if 0 (;@3;)
          drop
          local.get 1
          local.get 4
          local.get 3
          i32.const 12
          i32.add
          i32.const 3385856
          i32.load
          call 50458
          i32.const 0
          local.get 3
          i32.load offset=12
          i32.eqz
          br_if 0 (;@3;)
          drop
          local.get 1
          local.get 4
          local.get 3
          i32.const 12
          i32.add
          i32.const 3385856
          i32.load
          call 50458
          i32.const 0
          local.get 3
          i32.load offset=12
          i32.load offset=12
          i32.const 0
          i32.le_s
          br_if 0 (;@3;)
          drop
          local.get 1
          local.get 4
          local.get 3
          i32.const 12
          i32.add
          i32.const 3385856
          i32.load
          call 50458
          local.get 3
          i32.load offset=12
          i32.const 0
          local.get 3
          i32.const 12
          i32.add
          i32.const 3387848
          i32.load
          call 50458
          local.get 3
          i32.load offset=12
          local.set 2
          local.get 1
          local.get 4
          local.get 3
          i32.const 12
          i32.add
          i32.const 3385856
          i32.load
          call 50458
          local.get 2
          i32.const 0
          local.get 2
          i32.const 0
          i32.gt_s
          select
          local.set 2
          local.get 2
          local.get 3
          i32.load offset=12
          i32.load offset=12
          i32.const 2
          i32.lt_s
          br_if 0 (;@3;)
          drop
          local.get 1
          local.get 4
          local.get 3
          i32.const 12
          i32.add
          i32.const 3385856
          i32.load
          call 50458
          local.get 3
          i32.load offset=12
          i32.const 1
          local.get 3
          i32.const 12
          i32.add
          i32.const 3387848
          i32.load
          call 50458
          local.get 2
          local.get 3
          i32.load offset=12
          local.tee 5
          local.get 2
          local.get 5
          i32.gt_s
          select
        end
        local.set 5
        i32.const 3375600
        i32.load
        local.set 7
        local.get 0
        i32.load offset=200
        local.set 8
        local.get 3
        local.get 6
        local.get 4
        i32.const 2
        i32.shl
        i32.add
        i32.const 16
        i32.add
        local.tee 9
        i32.load
        i32.store offset=12
        local.get 3
        local.get 2
        i32.store offset=8
        local.get 8
        local.get 3
        i32.const 12
        i32.add
        local.get 3
        i32.const 8
        i32.add
        local.get 7
        call 34436
        i32.const 3375600
        i32.load
        local.set 2
        local.get 0
        i32.load offset=204
        local.set 7
        local.get 3
        local.get 9
        i32.load
        i32.store offset=12
        local.get 3
        local.get 5
        i32.store offset=8
        local.get 7
        local.get 3
        i32.const 12
        i32.add
        local.get 3
        i32.const 8
        i32.add
        local.get 2
        call 34436
        local.get 4
        i32.const 1
        i32.add
        local.tee 4
        local.get 6
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
